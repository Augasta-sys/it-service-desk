import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  FolderKanban,
  Layers3,
  Pencil,
  PieChart,
  Plus,
  Search,
  Ticket,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import type { Category } from "../types/category";
import type { Ticket as TicketType } from "../types/ticket";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

import { getTickets } from "../services/ticketService";

import CategoryForm from "../components/Categories/CategoryForm";
import ConfirmModal from "../components/common/ConfirmModal";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [error, setError] = useState("");

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [savingCategory, setSavingCategory] =
    useState(false);

  const [categoryToDelete, setCategoryToDelete] =
    useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] =
    useState(false);

  /*
   * Load categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCategories();

        setCategories(data);
      } catch (err) {
        console.error(
          "Failed to fetch categories:",
          err
        );

        setError(
          "Unable to load categories. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /*
   * Load tickets for category analytics
   */
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoadingTickets(true);

        const data = await getTickets();

        setTickets(data);
      } catch (err) {
        console.error(
          "Failed to fetch tickets:",
          err
        );
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);

  /*
   * Filter categories
   */
  const filteredCategories = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(search) ||
        category.description
          .toLowerCase()
          .includes(search) ||
        category.id
          .toLowerCase()
          .includes(search)
    );
  }, [categories, searchTerm]);

  /*
   * Statistics
   */
  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.status === "active"
  ).length;

  const inactiveCategories = categories.filter(
    (category) => category.status === "inactive"
  ).length;

  const totalTickets = tickets.length;

  /*
   * Category ticket counts
   *
   * Ticket.category stores the category ID.
   */
  const categoryTicketData = useMemo(() => {
    return categories
      .map((category) => {
        const count = tickets.filter(
          (ticket) =>
            ticket.category === category.id
        ).length;

        return {
          ...category,
          ticketCount: count,
        };
      })
      .sort(
        (a, b) =>
          b.ticketCount - a.ticketCount
      );
  }, [categories, tickets]);

  const maxTicketCount = Math.max(
    ...categoryTicketData.map(
      (category) => category.ticketCount
    ),
    1
  );

  /*
   * Ticket distribution
   */
  const ticketDistribution = useMemo(() => {
    return categoryTicketData.filter(
      (category) => category.ticketCount > 0
    );
  }, [categoryTicketData]);

  /*
   * Generate donut gradient
   */
  const donutGradient = useMemo(() => {
    if (totalCategories === 0) {
      return "conic-gradient(#e2e8f0 0deg 360deg)";
    }

    const activePercentage =
      (activeCategories / totalCategories) * 100;

    const activeDegrees =
      activePercentage * 3.6;

    return `conic-gradient(
      #10b981 0deg ${activeDegrees}deg,
      #cbd5e1 ${activeDegrees}deg 360deg
    )`;
  }, [
    totalCategories,
    activeCategories,
  ]);

  /*
   * Generate ticket pie gradient
   */
  const pieGradient = useMemo(() => {
    if (totalTickets === 0) {
      return "conic-gradient(#e2e8f0 0deg 360deg)";
    }

    const colors = [
      "#3b82f6",
      "#8b5cf6",
      "#06b6d4",
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#64748b",
    ];

const segments = ticketDistribution.map(
  (category, index) => {
    const percentage =
      (category.ticketCount /
        totalTickets) *
      100;

    const degrees =
      percentage * 3.6;

    const start = ticketDistribution
      .slice(0, index)
      .reduce(
        (sum, currentCategory) =>
          sum +
          ((currentCategory.ticketCount /
            totalTickets) *
            100) *
            3.6,
        0
      );

    const end = start + degrees;

    return `${colors[index % colors.length]} ${start}deg ${end}deg`;
  }
);

    if (segments.length === 0) {
      return "conic-gradient(#e2e8f0 0deg 360deg)";
    }

    return `conic-gradient(${segments.join(", ")})`;
  }, [
    ticketDistribution,
    totalTickets,
  ]);

  /*
   * Save category
   */
  const handleCategorySubmit = async (
    category: Category
  ) => {
    try {
      setSavingCategory(true);
      setError("");

      if (selectedCategory) {
        const updatedCategory =
          await updateCategory(
            selectedCategory.id,
            category
          );

        setCategories(
          (previousCategories) =>
            previousCategories.map(
              (item) =>
                item.id ===
                updatedCategory.id
                  ? updatedCategory
                  : item
            )
        );
      } else {
        const newCategory: Category = {
          ...category,
          id: `CAT${String(
            categories.length + 1
          ).padStart(3, "0")}`,
        };

        const createdCategory =
          await createCategory(
            newCategory
          );

        setCategories(
          (previousCategories) => [
            ...previousCategories,
            createdCategory,
          ]
        );
      }

      setShowCategoryForm(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error(
        "Failed to save category:",
        err
      );

      setError(
        "Unable to save category. Please try again."
      );
    } finally {
      setSavingCategory(false);
    }
  };

  /*
   * Delete category
   */
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      setDeletingCategory(true);
      setError("");

      await deleteCategory(
        categoryToDelete.id
      );

      setCategories(
        (previousCategories) =>
          previousCategories.filter(
            (item) =>
              item.id !==
              categoryToDelete.id
          )
      );

      setCategoryToDelete(null);
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err
      );

      setError(
        "Unable to delete category. Please try again."
      );
    } finally {
      setDeletingCategory(false);
    }
  };

  /*
   * Open Add Category
   */
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setError("");
    setShowCategoryForm(true);
  };

  /*
   * Open Edit Category
   */
  const handleEditCategory = (
    category: Category
  ) => {
    setSelectedCategory(category);
    setError("");
    setShowCategoryForm(true);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <FolderKanban size={22} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Categories
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage and monitor ticket categories
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
        >
          <Plus size={17} />

          <span>Add Category</span>
        </button>
      </div>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="group rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Categories
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalCategories}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Available categories
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
              <Layers3 size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-slate-500">
              Category list
            </span>

            <TrendingUp
              size={15}
              className="text-blue-500 transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>

        {/* Active */}
        <div className="group rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {activeCategories}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Currently available
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <CheckCircle2 size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-emerald-600">
              {totalCategories
                ? Math.round(
                    (activeCategories /
                      totalCategories) *
                      100
                  )
                : 0}
              % active
            </span>

            <Activity
              size={15}
              className="text-emerald-500"
            />
          </div>
        </div>

        {/* Inactive */}
        <div className="group rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Inactive
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {inactiveCategories}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Currently disabled
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110">
              <XCircle size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-slate-500">
              Needs review
            </span>

            <Activity
              size={15}
              className="text-amber-500"
            />
          </div>
        </div>

        {/* Tickets */}
        <div className="group rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Categorized Tickets
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalTickets}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Tickets across categories
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-110">
              <Ticket size={19} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-medium text-slate-500">
              Live from JSON Server
            </span>

            <TrendingUp
              size={15}
              className="text-violet-500"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          CHARTS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* CATEGORY BAR CHART */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BarChart3 size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Tickets by Category
                </h2>

                <p className="text-xs text-slate-500">
                  Ticket volume across categories
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {loadingTickets ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading chart...
                </p>
              </div>
            ) : categoryTicketData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <BarChart3
                  size={30}
                  className="text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-500">
                  No category data available
                </p>
              </div>
            ) : (
              categoryTicketData.map(
                (category, index) => {
                  const percentage =
                    (category.ticketCount /
                      maxTicketCount) *
                    100;

                  return (
                    <div
                      key={category.id}
                      className="group"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                            {index + 1}
                          </span>

                          <span className="truncate text-xs font-semibold text-slate-700 sm:text-sm">
                            {category.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-xs font-bold text-slate-900">
                          {category.ticketCount}
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out group-hover:from-indigo-500 group-hover:to-violet-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>

        {/* ACTIVE / INACTIVE DONUT */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <PieChart size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Category Status
                </h2>

                <p className="text-xs text-slate-500">
                  Active and inactive distribution
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[290px] flex-col items-center justify-center gap-6 p-5 sm:flex-row sm:gap-10">
            <div
              className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full transition-transform duration-500 hover:scale-105"
              style={{
                background: donutGradient,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-2xl font-bold text-slate-900">
                  {totalCategories}
                </span>

                <span className="text-[11px] font-medium text-slate-500">
                  Categories
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />

                  <span className="text-sm font-medium text-slate-700">
                    Active
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {activeCategories}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-slate-400" />

                  <span className="text-sm font-medium text-slate-700">
                    Inactive
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {inactiveCategories}
                </span>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <p className="text-xs leading-5 text-blue-700">
                  Active categories are available
                  for new ticket creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TICKET DISTRIBUTION PIE
      ====================================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 bg-white shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-lg">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <PieChart size={18} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Ticket Distribution
              </h2>

              <p className="text-xs text-slate-500">
                Proportion of tickets assigned to each category
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[330px] flex-col items-center justify-center gap-8 p-5 lg:flex-row lg:gap-14">
          <div
            className="relative flex h-56 w-56 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform duration-500 hover:scale-105"
            style={{
              background: pieGradient,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-2xl font-bold text-slate-900">
                {totalTickets}
              </span>

              <span className="text-[11px] font-medium text-slate-500">
                Tickets
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
            {ticketDistribution.length ===
            0 ? (
              <div className="col-span-full rounded-xl border border-slate-100 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  No ticket distribution data available.
                </p>
              </div>
            ) : (
              ticketDistribution.map(
                (category, index) => {
                  const colors = [
                    "bg-blue-500",
                    "bg-violet-500",
                    "bg-cyan-500",
                    "bg-amber-500",
                    "bg-emerald-500",
                    "bg-red-500",
                    "bg-slate-500",
                  ];

                  const percentage =
                    totalTickets > 0
                      ? Math.round(
                          (category.ticketCount /
                            totalTickets) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={category.id}
                      className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-3 w-3 shrink-0 rounded-full ${colors[index % colors.length]}`}
                        />

                        <span className="truncate text-xs font-semibold text-slate-700">
                          {category.name}
                        </span>
                      </div>

                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {category.ticketCount}
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH + CATEGORY TABLE
      ====================================================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-slate-900 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban
                size={17}
                className="text-slate-700"
              />

              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Category Management
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1
                ? "category"
                : "categories"}{" "}
              displayed
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search categories..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-5">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed">
            <colgroup>
              <col className="w-[23%]" />
              <col className="w-[37%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>

            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  Category
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  Description
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  Tickets
                </th>

                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:px-5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <FolderKanban
                          size={19}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-500">
                        Loading categories...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-t-4 border-t-slate-200 px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <Search
                        size={28}
                        className="text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No categories found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map(
                  (category) => {
                    const categoryTickets =
                      categoryTicketData.find(
                        (item) =>
                          item.id ===
                          category.id
                      )?.ticketCount ?? 0;

                    return (
                      <tr
                        key={category.id}
                        className="group transition-all duration-300 hover:bg-slate-50/80"
                      >
                        {/* Category */}
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-100">
                              <FolderKanban
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                                {category.name}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                {category.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5 sm:px-5">
                          <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                            {category.description ||
                              "No description available."}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 sm:px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              category.status ===
                              "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                category.status ===
                                "active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {category.status ===
                            "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Ticket count */}
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 transition-all duration-300 group-hover:bg-blue-50">
                            <Ticket
                              size={13}
                              className="text-slate-400 transition-colors group-hover:text-blue-500"
                            />

                            <span className="text-xs font-bold text-slate-700">
                              {categoryTickets}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 sm:px-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Edit category"
                              onClick={() =>
                                handleEditCategory(
                                  category
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md active:scale-95"
                            >
                              <Pencil
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              title="Delete category"
                              onClick={() => {
                                setError("");
                                setCategoryToDelete(
                                  category
                                );
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md active:scale-95"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          CATEGORY FORM
      ====================================================== */}
      {showCategoryForm && (
        <CategoryForm
          initialCategory={
            selectedCategory
          }
          onSubmit={handleCategorySubmit}
          onCancel={() => {
            if (!savingCategory) {
              setShowCategoryForm(false);
              setSelectedCategory(null);
            }
          }}
          loading={savingCategory}
        />
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category"
        message={
          categoryToDelete
            ? `Are you sure you want to delete the "${categoryToDelete.name}" category?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={
          handleDeleteCategory
        }
        onCancel={() => {
          if (!deletingCategory) {
            setCategoryToDelete(null);
          }
        }}
        loading={deletingCategory}
      />
    </div>
  );
};

export default Categories;