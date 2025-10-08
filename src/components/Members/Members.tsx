import { useState, useEffect } from 'react';
import { supabase, Profile } from '../../lib/supabase';
import { Users, Filter, Edit2, UserPlus } from 'lucide-react';
import { RITE_NAMES, STATUS_NAMES } from '../../utils/lodgeYear';

export function Members() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riteFilter, setRiteFilter] = useState<string>('all');

  useEffect(() => {
    loadMembers();
  }, [statusFilter, riteFilter]);

  const loadMembers = async () => {
    try {
      let query = supabase.from('profiles').select('*');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (riteFilter !== 'all') {
        query = query.eq('rite', riteFilter);
      }

      const { data, error } = await query.order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'licencia': return 'bg-blue-100 text-blue-800';
      case 'cese': return 'bg-gray-100 text-gray-800';
      case 'expulsion': return 'bg-red-100 text-red-800';
      case 'ad_vitam': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiteColor = (rite: string) => {
    switch (rite) {
      case 'escoces_antiguo': return 'text-red-600';
      case 'antiguo_gremio': return 'text-blue-900';
      case 'emulacion': return 'text-blue-900';
      case 'york': return 'text-blue-900';
      case 'memphis': return 'text-sky-500';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Miembros</h2>
          <p className="text-slate-600 mt-1">{members.length} miembros encontrados</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Miembro</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rito
              </label>
              <select
                value={riteFilter}
                onChange={(e) => setRiteFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">Todos los ritos</option>
                {Object.entries(RITE_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Rito</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Fecha Licencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900">{member.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {member.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getRiteColor(member.rite)}`}>
                      {RITE_NAMES[member.rite]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {STATUS_NAMES[member.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {member.license_start_date
                      ? new Date(member.license_start_date).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-600 hover:text-slate-900">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {members.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No se encontraron miembros con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}
