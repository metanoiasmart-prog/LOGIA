import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  LogOut
} from 'lucide-react';

type Stats = {
  totalMembers: number;
  activeMembers: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingPayments: number;
  activeAlerts: number;
};

export function Dashboard() {
  const { signOut, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingPayments: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [membersRes, feesRes, expensesRes, alertsRes] = await Promise.all([
        supabase.from('profiles').select('status', { count: 'exact' }),
        supabase.from('monthly_fees').select('status, paid_amount'),
        supabase.from('expenses').select('amount'),
        supabase.from('alerts').select('*', { count: 'exact' }).eq('is_active', true),
      ]);

      const totalMembers = membersRes.count || 0;
      const activeMembers = membersRes.data?.filter(m => m.status === 'activo').length || 0;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const monthlyIncome = feesRes.data
        ?.filter(f => f.status === 'paid')
        .reduce((sum, f) => sum + (f.paid_amount || 0), 0) || 0;

      const monthlyExpenses = expensesRes.data
        ?.reduce((sum, e) => sum + e.amount, 0) || 0;

      const pendingPayments = feesRes.data
        ?.filter(f => f.status === 'pending' || f.status === 'late').length || 0;

      setStats({
        totalMembers,
        activeMembers,
        monthlyIncome,
        monthlyExpenses,
        pendingPayments,
        activeAlerts: alertsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <LayoutDashboard className="w-8 h-8 text-slate-900" />
              <h1 className="ml-3 text-2xl font-bold text-slate-900">LOGIA</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{profile?.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Principal</h2>
          <p className="text-slate-600 mt-2">Año Logial: Julio {new Date().getMonth() >= 6 ? new Date().getFullYear() : new Date().getFullYear() - 1} - Junio {new Date().getMonth() >= 6 ? new Date().getFullYear() + 1 : new Date().getFullYear()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Miembros</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalMembers}</p>
                <p className="text-sm text-green-600 mt-1">{stats.activeMembers} activos</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-slate-900" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-green-600 mt-2">${stats.monthlyIncome.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Gastos del Mes</p>
                <p className="text-3xl font-bold text-red-600 mt-2">${stats.monthlyExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingPayments}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Alertas Activas</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.activeAlerts}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Balance Mensual</p>
                <p className={`text-3xl font-bold mt-2 ${stats.monthlyIncome - stats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(stats.monthlyIncome - stats.monthlyExpenses).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-100 p-3 rounded-full">
                <FileText className="w-8 h-8 text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Módulos del Sistema</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-slate-900" />
                  <span className="font-medium text-slate-900">Gestión de Miembros</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-slate-900" />
                  <span className="font-medium text-slate-900">Tesorería</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-slate-900" />
                  <span className="font-medium text-slate-900">Gastos</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-slate-900" />
                  <span className="font-medium text-slate-900">Cuotas Extraordinarias</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Próximos Vencimientos</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Renta del Templo</p>
                  <p className="text-sm text-slate-600">Vence el 5 de cada mes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Membresía</p>
                  <p className="text-sm text-slate-600">Vence el 5 de cada mes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
