'use client';

import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, getInitials, roleBadgeClass, capitalize } from '@/lib/utils';
import { Button, Modal, Select, EmptyState, Badge, Alert } from '@/components/ui';
import { Users, Search, Trash2, Shield, UserCheck, MoreVertical } from 'lucide-react';

const ROLES = ['admin', 'treasurer', 'member'];

function RoleModal({ user, onClose, onSave }) {
  const [role, setRole]       = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await usersAPI.updateRole(user._id, role);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Change Role — ${user.name}`} size="sm">
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <Select label="New Role" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{capitalize(r)}</option>
          ))}
        </Select>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={handleSave}>Update Role</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function MembersPage() {
  const { isAdmin, canEdit, user: currentUser } = useAuth();
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [roleModal, setRoleModal]   = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState('');
  const [total, setTotal]           = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const { data } = await usersAPI.getAll(params);
      setMembers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 300);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersAPI.delete(deleteId);
      setDeleteId(null);
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setDeleting(false);
    }
  };

  const roleColor = { admin: 'purple', treasurer: 'blue', member: 'gray' };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Members</h2>
          <p className="page-subtitle">{total} total members</p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-full sm:w-40"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{capitalize(r)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {['Member', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={Users}
                      title="No members found"
                      description="Try adjusting your search or filters."
                    />
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member._id} className="hover:bg-surface-50 transition-colors">
                    {/* Name + Avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-brand-700">
                            {getInitials(member.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{member.name}</p>
                          {!member.isActive && (
                            <span className="text-xs text-red-500">Deactivated</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-surface-500">{member.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge color={roleColor[member.role]}>{capitalize(member.role)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-surface-500">{formatDate(member.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {isAdmin && member._id !== currentUser?.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRoleModal(member)}
                            title="Change role"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(member._id)}
                            title="Remove member"
                            className="hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                      {member._id === currentUser?.id && (
                        <span className="text-xs text-surface-400 italic">You</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {roleModal && (
        <RoleModal
          user={roleModal}
          onClose={() => setRoleModal(null)}
          onSave={() => { setRoleModal(null); fetchMembers(); }}
        />
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Member" size="sm">
        <p className="text-sm text-surface-600 mb-5">
          Are you sure you want to deactivate this member? They will lose access to EcoHub.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Remove Member</Button>
        </div>
      </Modal>
    </div>
  );
}
