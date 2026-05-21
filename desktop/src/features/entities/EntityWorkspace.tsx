import { useEffect, useMemo, useRef, useState } from "react";
import { createOfflineOperation, formatDate } from "@futuredesk/shared";
import { apiClient } from "../../lib/api";
import { enqueueOperation } from "../../lib/offlineDb";
import { useAppStore } from "../../store/appStore";
import {
  buildQueryString,
  entityConfig,
  prepareModuleFilters,
  summarizeModuleRecord,
  type EntitySection
} from "./entityConfig";
import { AddEntityModal } from "./AddEntityModal";

type FilterState = Record<string, string | boolean>;

function formatOption(value?: string): string {
  if (!value) {
    return "-";
  }

  return value.replaceAll("_", " ");
}

export function EntityWorkspace({ section }: { section: EntitySection }) {
  const items = useAppStore((state) => state[section]);
  const setCollection = useAppStore((state) => state.setCollection);
  const setError = useAppStore((state) => state.setError);
  const definition = entityConfig[section];
  const [filters, setFilters] = useState<FilterState>({ ...definition.filterDefaults });
  const [visibleItems, setVisibleItems] = useState(items as Array<Record<string, any>>);
  const [isLoading, setIsLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [taskView, setTaskView] = useState<"board" | "checklist">("board");
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const filterPopoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFilters({ ...definition.filterDefaults });
    setActiveFilter(null);
    if (section !== "tasks") {
      setTaskView("board");
    }
  }, [definition.filterDefaults, section]);

  const preparedFilters = useMemo(() => prepareModuleFilters(filters), [filters]);
  const hasActiveFilters = Object.keys(preparedFilters).length > 0;
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    (items as Array<{ tags?: string[] }>).forEach((item) => {
      item.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [items]);

  useEffect(() => {
    if (!hasActiveFilters) {
      setVisibleItems(items as Array<Record<string, any>>);
    }
  }, [hasActiveFilters, items]);

  useEffect(() => {
    if (!filterOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterButtonRef.current?.contains(target) || filterPopoverRef.current?.contains(target)) {
        return;
      }

      setFilterOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!hasActiveFilters) {
      setVisibleItems(items as Array<Record<string, any>>);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      try {
        const filtered = await apiClient.request<Array<Record<string, any>>>(
          `${definition.endpoint}${buildQueryString(preparedFilters)}`
        );

        if (!cancelled) {
          setVisibleItems(filtered);
          setError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to apply filters");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [definition.endpoint, hasActiveFilters, items, preparedFilters, setError]);

  const availableFilters = definition.filters.filter((filter) => filter.name !== "search");
  const resolvedActiveFilter =
    activeFilter && availableFilters.find((filter) => filter.name === activeFilter)
      ? activeFilter
      : availableFilters[0]?.name ?? null;
  const toggleTag = (tag: string) => {
    setFilters((current) => {
      const raw = typeof current.tags === "string" ? current.tags : "";
      const list = raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      const hasTag = list.includes(tag);
      const next = hasTag ? list.filter((value) => value !== tag) : [...list, tag];
      return { ...current, tags: next.join(", ") };
    });
  };

  const updateTaskStatus = async (taskId: string, status: "todo" | "in_progress" | "done") => {
    if (section !== "tasks") {
      return;
    }

    const optimistic = (items as Array<Record<string, any>>).map((item) =>
      item.id === taskId ? { ...item, status } : item
    );
    const optimisticVisible = visibleItems.map((item) => (item.id === taskId ? { ...item, status } : item));
    setCollection("tasks", optimistic as any);
    setVisibleItems(optimisticVisible);

    try {
      const updated = await apiClient.request<Record<string, any>>(`${definition.endpoint}/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      const next = (optimistic as Array<Record<string, any>>).map((item) => (item.id === updated.id ? updated : item));
      const nextVisible = optimisticVisible.map((item) => (item.id === updated.id ? updated : item));
      setCollection("tasks", next as any);
      setVisibleItems(nextVisible);
      setError(null);
    } catch (error) {
      await enqueueOperation(createOfflineOperation("task", "update", { id: taskId, status }));
      setError(error instanceof Error ? error.message : "Saved to offline queue");
    }
  };

  const taskColumns = useMemo(
    () => [
      { id: "todo", label: "To-do" },
      { id: "in_progress", label: "In-process" },
      { id: "done", label: "Done" }
    ],
    []
  );
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Array<Record<string, any>>> = {
      todo: [],
      in_progress: [],
      done: []
    };
    (visibleItems as Array<Record<string, any>>).forEach((item) => {
      const status = item.status ?? "todo";
      if (status in grouped) {
        grouped[status].push(item);
      }
    });
    return grouped;
  }, [visibleItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-[18px] border border-stone-200 p-3">
        <div className="relative flex min-w-0 flex-1 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-stone-200 px-3 py-2 text-sm">
            <input
              className="w-full bg-transparent text-sm text-slate-600 outline-none"
              placeholder="Search"
              value={typeof filters.search === "string" ? filters.search : ""}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </div>
          <button
            ref={filterButtonRef}
            className="shrink-0 rounded-xl border border-stone-200 p-2.5 text-slate-600"
            onClick={() => setFilterOpen((open) => !open)}
            type="button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>

          {filterOpen ? (
            <div
              ref={filterPopoverRef}
              className="absolute left-0 top-[52px] z-20 w-[480px] overflow-hidden rounded-[18px] border border-stone-200 bg-white shadow-card"
            >
              <div className="grid grid-cols-[160px_1fr]">
                <div className="border-r border-stone-200 bg-stone-50 p-3">
                  <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-slate-400">Filters</div>
                  <div className="flex flex-col gap-1">
                    {availableFilters.map((filter) => {
                      const isActive = resolvedActiveFilter === filter.name;
                      return (
                        <button
                          key={filter.name}
                          className={`rounded-lg px-2.5 py-2 text-left text-xs font-medium ${
                            isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-white"
                          }`}
                          onClick={() => setActiveFilter(filter.name)}
                          type="button"
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4">
                  {resolvedActiveFilter ? (
                    availableFilters
                      .filter((filter) => filter.name === resolvedActiveFilter)
                      .map((filter) => {
                        if (filter.type === "tags") {
                          return (
                            <div key={filter.name}>
                              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{filter.label}</div>
                              <div className="flex flex-wrap gap-2">
                                {availableTags.length === 0 ? (
                                  <div className="text-sm text-slate-500">No tags yet.</div>
                                ) : (
                                  availableTags.map((tag) => {
                                    const checked = typeof filters.tags === "string" && filters.tags.split(",").map((value) => value.trim()).includes(tag);
                                    return (
                                      <label
                                        key={tag}
                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                                          checked ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                                        }`}
                                      >
                                        <input checked={checked} onChange={() => toggleTag(tag)} type="checkbox" />
                                        <span>{tag}</span>
                                      </label>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (filter.type === "select") {
                          return (
                            <div key={filter.name}>
                              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">{filter.label}</div>
                              <div className="flex flex-wrap gap-2">
                                {(filter.options ?? []).map((option) => {
                                  const checked = filters[filter.name] === option;
                                  return (
                                    <label
                                      key={option}
                                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                                        checked ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                                      }`}
                                    >
                                      <input
                                        checked={checked}
                                        onChange={(event) =>
                                          setFilters((current) => ({
                                            ...current,
                                            [filter.name]: event.target.checked ? option : ""
                                          }))
                                        }
                                        type="checkbox"
                                      />
                                      <span>{formatOption(option)}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        if (filter.type === "checkbox") {
                          const checked = Boolean(filters[filter.name]);
                          return (
                            <label
                              key={filter.name}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                                checked ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                              }`}
                            >
                              <input
                                checked={checked}
                                onChange={(event) =>
                                  setFilters((current) => ({ ...current, [filter.name]: event.target.checked }))
                                }
                                type="checkbox"
                              />
                              <span>{filter.label}</span>
                            </label>
                          );
                        }

                        const checked = filters[filter.name] === "__exists__";

                        return (
                          <label
                            key={filter.name}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                              checked ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                            }`}
                          >
                            <input
                              checked={checked}
                              onChange={(event) =>
                                setFilters((current) => ({
                                  ...current,
                                  [filter.name]: event.target.checked ? "__exists__" : ""
                                }))
                              }
                              type="checkbox"
                            />
                            <span>Has {filter.label.toLowerCase()}</span>
                          </label>
                        );
                      })
                  ) : (
                    <div className="text-sm text-slate-500">No filters available.</div>
                  )}

                  <div className="mt-4 flex justify-between gap-2">
                    <button
                      className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-slate-600"
                      onClick={() => setFilters({ ...definition.filterDefaults })}
                      type="button"
                    >
                      Reset
                    </button>
                    <button
                      className="rounded-xl bg-ink px-3 py-2 text-sm text-white"
                      onClick={() => setFilterOpen(false)}
                      type="button"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {section === "tasks" ? (
            <div className="flex items-center rounded-xl border border-stone-200 p-1 text-xs">
              <button
                className={`rounded-lg px-3 py-2 ${taskView === "board" ? "bg-ink text-white" : "text-slate-600"}`}
                onClick={() => setTaskView("board")}
                type="button"
              >
                Board
              </button>
              <button
                className={`rounded-lg px-3 py-2 ${taskView === "checklist" ? "bg-ink text-white" : "text-slate-600"}`}
                onClick={() => setTaskView("checklist")}
                type="button"
              >
                Checklist
              </button>
            </div>
          ) : null}
          <button
            className="shrink-0 rounded-xl bg-ink px-4 py-2 text-sm text-white"
            onClick={() => {
              setEditingItem(null);
              setAddOpen(true);
            }}
          >
            Add
          </button>
        </div>
      </div>

      {isLoading ? <div className="text-sm text-slate-500">Refreshing {definition.label.toLowerCase()}...</div> : null}

      {section === "tasks" && taskView === "board" ? (
        <div className="grid gap-3 md:grid-cols-3">
          {taskColumns.map((column) => (
            <div
              key={column.id}
              className="flex min-h-[280px] flex-col gap-3 rounded-[18px] border border-dashed border-stone-200 bg-stone-50/60 p-3"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData("text/plain");
                if (taskId) {
                  updateTaskStatus(taskId, column.id as "todo" | "in_progress" | "done");
                }
              }}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{column.label}</div>
              <div className="space-y-2">
                {tasksByStatus[column.id].length === 0 ? (
                  <div className="rounded-xl bg-white px-3 py-3 text-xs text-slate-400">No tasks</div>
                ) : (
                  tasksByStatus[column.id].map((task) => (
                    <div
                      key={task.id}
                      className="cursor-grab rounded-xl bg-white px-3 py-3 shadow-card"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", task.id);
                      }}
                      onClick={() => {
                        setEditingItem(task);
                        setAddOpen(false);
                      }}
                    >
                      <div className="text-sm font-medium text-ink">{task.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{task.description ?? "Task detail"}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : section === "tasks" && taskView === "checklist" ? (
        <div className="space-y-3">
          {(visibleItems as Array<Record<string, any>>).map((task) => (
            <label
              key={task.id}
              className="flex items-start gap-3 rounded-[18px] border border-stone-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
            >
              <input
                checked={task.status === "done"}
                onChange={(event) => updateTaskStatus(task.id, event.target.checked ? "done" : "todo")}
                type="checkbox"
              />
              <div className="flex-1">
                <div className="font-medium text-ink">{task.title}</div>
                <div className="mt-1 text-sm text-slate-500">{task.description ?? "Task detail"}</div>
                <div className="mt-2 text-xs text-slate-400">Status: {formatOption(task.status)}</div>
              </div>
              <button
                className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-slate-600"
                onClick={(event) => {
                  event.preventDefault();
                  setEditingItem(task);
                  setAddOpen(false);
                }}
                type="button"
              >
                Edit
              </button>
            </label>
          ))}
          {visibleItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No tasks match the current view.</div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const summary = summarizeModuleRecord(section, item as never);

            return (
              <div
                key={item.id}
                className="rounded-[18px] border border-stone-200 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{summary.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{summary.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary.badge ? (
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        {formatOption(summary.badge)}
                      </span>
                    ) : null}
                    <button
                      className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-slate-600"
                      onClick={() => {
                        setEditingItem(item as Record<string, any>);
                        setAddOpen(false);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Status</div>
                    <div className="mt-1">{formatOption(summary.status)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Primary date</div>
                    <div className="mt-1">{summary.primaryDate ? formatDate(summary.primaryDate) : "No date"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Context</div>
                    <div className="mt-1">{summary.secondaryMeta ?? "-"}</div>
                  </div>
                </div>

                {"tags" in item && Array.isArray(item.tags) && item.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="rounded-full border border-stone-200 px-2.5 py-1 text-xs text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {visibleItems.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">No {definition.label.toLowerCase()} match the current view.</div>
          ) : null}
        </div>
      )}
      <AddEntityModal
        open={addOpen || Boolean(editingItem)}
        onClose={() => {
          setAddOpen(false);
          setEditingItem(null);
        }}
        section={section}
        record={editingItem}
      />
    </div>
  );
}
