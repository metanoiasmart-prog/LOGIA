import { useState, useEffect } from 'react';
import { supabase, MonthlyFee, Profile } from '../../lib/supabase';
import { Upload, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { MONTH_NAMES, getCurrentLodgeYear } from '../../utils/lodgeYear';

type MemberFee = MonthlyFee & {
  member: Profile;
};

export function Treasury() {
  const [fees, setFees] = useState<MemberFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentLodgeYear());
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null);

  useEffect(() => {
    loadFees();
  }, [selectedYear]);

  const loadFees = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_fees')
        .select(`
          *,
          member:profiles(*)
        `)
        .eq('lodge_year', selectedYear)
        .order('month', { ascending: true });

      if (error) throw error;
      setFees(data as any || []);
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeId: string, amount: number) => {
    try {
      const fee = fees.find(f => f.id === feeId);
      if (!fee) return;

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      let status = 'paid';
      if (currentMonth > fee.month || (currentMonth === fee.month && currentYear > fee.year)) {
        status = 'late';
      }

      const { error } = await supabase
        .from('monthly_fees')
        .update({
          status,
          paid_date: now.toISOString(),
          paid_amount: amount,
        })
        .eq('id', feeId);

      if (error) throw error;

      await supabase.from('payment_history').insert({
        member_id: fee.member_id,
        payment_type: 'monthly_fee',
        reference_id: feeId,
        amount,
        payment_date: now.toISOString(),
        month: fee.month,
        year: fee.year,
        lodge_year: fee.lodge_year,
      });

      loadFees();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleReceiptUpload = async (feeId: string, file: File) => {
    setUploadingReceipt(feeId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${feeId}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('monthly_fees')
        .update({ payment_receipt_url: publicUrl })
        .eq('id', feeId);

      if (updateError) throw updateError;

      loadFees();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Error al subir el comprobante');
    } finally {
      setUploadingReceipt(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'late': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  const groupedByMember = fees.reduce((acc, fee) => {
    const memberId = fee.member_id;
    if (!acc[memberId]) {
      acc[memberId] = {
        member: fee.member,
        fees: [],
      };
    }
    acc[memberId].fees.push(fee);
    return acc;
  }, {} as Record<string, { member: Profile; fees: MonthlyFee[] }>);

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Panel de Tesorería</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">
            Año Logial:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
          >
            {[...Array(5)].map((_, i) => {
              const year = getCurrentLodgeYear() - i;
              return (
                <option key={year} value={year}>
                  Julio {year} - Junio {year + 1}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {Object.values(groupedByMember).map(({ member, fees: memberFees }) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{member.full_name}</h3>
                  <p className="text-sm text-slate-600">{member.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  member.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Mes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Fecha Pago</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Comprobante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {memberFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {MONTH_NAMES[fee.month - 1]} {fee.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        ${fee.amount.toFixed(2)}
                        {fee.status === 'late' && (
                          <span className="ml-2 text-red-600 text-xs">
                            (Atrasado: ${fee.paid_amount.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                          {getStatusIcon(fee.status)}
                          <span>{fee.status === 'paid' ? 'Pagado' : fee.status === 'late' ? 'Atrasado' : 'Pendiente'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {fee.paid_date ? new Date(fee.paid_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {fee.payment_receipt_url ? (
                          <a
                            href={fee.payment_receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver
                          </a>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReceiptUpload(fee.id, file);
                              }}
                              disabled={uploadingReceipt === fee.id}
                            />
                            <div className="flex items-center space-x-1 text-slate-600 hover:text-slate-900">
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">
                                {uploadingReceipt === fee.id ? 'Subiendo...' : 'Subir'}
                              </span>
                            </div>
                          </label>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {fee.status !== 'paid' && fee.status !== 'late' && (
                          <button
                            onClick={() => handlePayment(fee.id, fee.amount)}
                            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Registrar Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
