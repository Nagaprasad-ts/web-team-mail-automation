import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Plus,
    Search,
    Trash,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Department = {
    id: number;
    department: string;
    email: string;
    active: boolean;
};

type Props = {
    departments: Department[];
};

export default function RecipientsPage({ departments }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<Department | null>(null);
    const [removeTarget, setRemoveTarget] = useState<Department | null>(null);
    const [working, setWorking] = useState(false);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);

    const PAGE_SIZE = 15;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return departments;
        return departments.filter(
            (d) =>
                d.department.toLowerCase().includes(q) ||
                d.email.toLowerCase().includes(q),
        );
    }, [departments, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const toggleRow = (id: number) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const allOnPageSelected =
        pageRows.length > 0 && pageRows.every((d) => selected.has(d.id));

    const togglePageAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (allOnPageSelected) {
                pageRows.forEach((d) => next.delete(d.id));
            } else {
                pageRows.forEach((d) => next.add(d.id));
            }
            return next;
        });

    const selectAllMatching = () =>
        setSelected(new Set(filtered.map((d) => d.id)));

    const clearSelection = () => setSelected(new Set());

    const confirmDeleteSelected = () => {
        setWorking(true);
        router.post(
            '/mail-automation/departments/bulk-delete',
            { ids: Array.from(selected), _method: 'POST' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${selected.size} recipient(s) removed.`);
                    clearSelection();
                },
                onFinish: () => {
                    setWorking(false);
                    setDeleteSelectedOpen(false);
                },
            },
        );
    };

    const confirmDeleteAll = () => {
        setWorking(true);
        router.delete('/mail-automation/departments', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('All recipients removed.');
                clearSelection();
            },
            onFinish: () => {
                setWorking(false);
                setDeleteAllOpen(false);
            },
        });
    };

    const addForm = useForm({ department: '', email: '' });
    const editForm = useForm({ department: '', email: '', active: true });

    const openEdit = (d: Department) => {
        editForm.setData({
            department: d.department,
            email: d.email,
            active: d.active,
        });
        setEditing(d);
    };

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        addForm.post('/mail-automation/departments', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
                toast.success('Recipient added.');
            },
        });
    };

    const handleEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        editForm.patch(`/mail-automation/departments/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(null);
                toast.success('Recipient updated.');
            },
        });
    };

    const toggleActive = (d: Department) => {
        router.patch(
            `/mail-automation/departments/${d.id}`,
            {
                department: d.department,
                email: d.email,
                active: !d.active,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        `${d.department} ${d.active ? 'paused' : 'reactivated'}.`,
                    ),
            },
        );
    };

    const confirmRemove = () => {
        if (!removeTarget) return;
        setWorking(true);
        router.delete(`/mail-automation/departments/${removeTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Recipient removed.'),
            onFinish: () => {
                setWorking(false);
                setRemoveTarget(null);
            },
        });
    };

    const activeCount = departments.filter((d) => d.active).length;

    return (
        <>
            <Head title="Recipients" />

            <ConfirmDialog
                open={removeTarget !== null}
                onOpenChange={(o) => !o && setRemoveTarget(null)}
                title="Remove recipient?"
                description={
                    removeTarget ? (
                        <>
                            <span className="font-medium text-foreground">
                                {removeTarget.department}
                            </span>{' '}
                            ({removeTarget.email}) will be removed permanently.
                        </>
                    ) : null
                }
                confirmLabel="Remove"
                destructive
                loading={working}
                onConfirm={confirmRemove}
            />

            {/* Add dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add recipient</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <div className="space-y-1">
                            <Label>Department name</Label>
                            <Input
                                value={addForm.data.department}
                                onChange={(e) =>
                                    addForm.setData('department', e.target.value)
                                }
                                placeholder="e.g. Computer Science & Engineering"
                                required
                            />
                            {addForm.errors.department && (
                                <p className="text-xs text-red-600">
                                    {addForm.errors.department}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={addForm.data.email}
                                onChange={(e) =>
                                    addForm.setData('email', e.target.value)
                                }
                                placeholder="hod@dept.college.edu"
                                required
                            />
                            {addForm.errors.email && (
                                <p className="text-xs text-red-600">
                                    {addForm.errors.email}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                <Plus className="size-4" /> Add
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit recipient</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-3">
                        <div className="space-y-1">
                            <Label>Department name</Label>
                            <Input
                                value={editForm.data.department}
                                onChange={(e) =>
                                    editForm.setData(
                                        'department',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) =>
                                    editForm.setData('email', e.target.value)
                                }
                                required
                            />
                            {editForm.errors.email && (
                                <p className="text-xs text-red-600">
                                    {editForm.errors.email}
                                </p>
                            )}
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={editForm.data.active}
                                onCheckedChange={(v) =>
                                    editForm.setData('active', !!v)
                                }
                            />
                            Active (included in automated schedule by default)
                        </label>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        title="Recipients"
                        description="Manage the master list of department contacts. Active recipients are included in the automated schedule by default."
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteAllOpen(true)}
                            disabled={departments.length === 0}
                        >
                            <Trash className="size-4" /> Delete all
                        </Button>
                        <Button onClick={() => setAddOpen(true)}>
                            <UserPlus className="size-4" /> Add recipient
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total" value={departments.length} />
                    <StatCard
                        label="Active"
                        value={activeCount}
                        tint="text-green-600"
                    />
                    <StatCard
                        label="Paused"
                        value={departments.length - activeCount}
                        tint="text-amber-600"
                    />
                </div>

                <div className="rounded-xl border">
                    {departments.length > 0 && (
                        <div className="space-y-3 border-b p-3">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Search by department or email..."
                                        className="pl-9 pr-9"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={() => setQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                                            title="Clear search"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                    {filtered.length} of {departments.length}
                                </span>
                            </div>

                            {selected.size > 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                                    <span>
                                        <span className="font-semibold">
                                            {selected.size}
                                        </span>{' '}
                                        selected
                                        {selected.size < filtered.length && (
                                            <>
                                                {' '}
                                                ·{' '}
                                                <button
                                                    type="button"
                                                    onClick={selectAllMatching}
                                                    className="underline"
                                                >
                                                    Select all {filtered.length}
                                                </button>
                                            </>
                                        )}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSelection}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setDeleteSelectedOpen(true)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                            Delete selected
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {departments.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 p-12 text-center">
                            <Users className="size-10 text-muted-foreground" />
                            <h3 className="font-medium">No recipients yet</h3>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                Add the first department contact to start
                                sending newsletters.
                            </p>
                            <Button onClick={() => setAddOpen(true)}>
                                <UserPlus className="size-4" /> Add recipient
                            </Button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No recipients match &quot;{query}&quot;.
                        </div>
                    ) : (
                        <>
                        <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
                            <Checkbox
                                checked={allOnPageSelected}
                                onCheckedChange={togglePageAll}
                                title="Select all on this page"
                            />
                            <span>Select page</span>
                        </div>
                        <ul className="divide-y">
                            {pageRows.map((d) => {
                                const isSelected = selected.has(d.id);
                                return (
                                    <li
                                        key={d.id}
                                        className={
                                            'group relative flex items-center gap-4 px-4 py-3 transition-colors ' +
                                            (isSelected
                                                ? 'bg-primary/5'
                                                : 'hover:bg-muted/40')
                                        }
                                    >
                                        {isSelected && (
                                            <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                                        )}
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                toggleRow(d.id)
                                            }
                                            title="Select"
                                        />

                                        <div
                                            className={
                                                'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ' +
                                                (d.active
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground')
                                            }
                                            title={d.department}
                                        >
                                            {d.department
                                                .split(/\s+/)
                                                .map((w) => w[0])
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {d.department}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {d.email}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleActive(d)}
                                            className={
                                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ' +
                                                (d.active
                                                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20')
                                            }
                                            title={
                                                d.active
                                                    ? 'Click to pause'
                                                    : 'Click to activate'
                                            }
                                        >
                                            <span
                                                className={
                                                    'size-1.5 rounded-full ' +
                                                    (d.active
                                                        ? 'bg-green-500'
                                                        : 'bg-amber-500')
                                                }
                                            />
                                            {d.active ? 'Active' : 'Paused'}
                                        </button>

                                        <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(d)}
                                                title="Edit"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setRemoveTarget(d)
                                                }
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                                <span className="text-muted-foreground">
                                    Page {currentPage} of {totalPages} ·{' '}
                                    {filtered.length} recipients
                                </span>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="size-4" />
                                        Prev
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1),
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={deleteAllOpen}
                onOpenChange={setDeleteAllOpen}
                title="Delete all recipients?"
                description={`This will permanently remove all ${departments.length} recipients. This action cannot be undone.`}
                confirmLabel="Delete all"
                destructive
                loading={working}
                onConfirm={confirmDeleteAll}
            />

            <ConfirmDialog
                open={deleteSelectedOpen}
                onOpenChange={setDeleteSelectedOpen}
                title={`Delete ${selected.size} recipient${selected.size === 1 ? '' : 's'}?`}
                description="The selected recipients will be permanently removed."
                confirmLabel="Delete"
                destructive
                loading={working}
                onConfirm={confirmDeleteSelected}
            />
        </>
    );
}
