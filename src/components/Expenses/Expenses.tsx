import { useState, useEffect } from 'react';
import { supabase, Expense } from '../../lib/supabase';
import { Receipt, Upload, Plus, Trash2 } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../utils/lodgeYear';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'otros',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('expenses').insert({
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
      });

      if (error) throw error;

      setFormData({
        category: 'otros',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(false);
      loadExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error al agregar gasto');
    }
  };

  const handleReceiptUpload = async (expenseId: string, file: File) => {
    setUploadingReceipt(expenseId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${expenseId}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('expenses')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('expenses')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('expenses')
        .update({ receipt_url: publicUrl })
        .eq('id', expenseId);

      if (updateError) throw updateError;

      loadExpenses();
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Error al subir el comprobante');
    } finally {
      setUploadingReceipt(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      alimentacion: 'bg-green-100 text-green-800',
      alquiler: 'bg-blue-100 text-blue-800',
      servicios_basicos: 'bg-yellow-100 text-yellow-800',
      articulos_activos: 'bg-purple-100 text-purple-800',
      membresia: 'bg-red-100 text-red-800',
      otros: 'bg-gray-100 text-gray-800',
      filantropia: 'bg-pink-100 text-pink-800',
      eventos: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Gastos</h2>
          <p className="text-slate-600 mt-1">Total: ${totalExpenses.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Gasto</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Agregar Gasto</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  required
                >
                  {Object.entries(EXPENSE_CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monto
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Comprobante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {EXPENSE_CATEGORIES[expense.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {expense.receipt_url ? (
                      <a
                        href={expense.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Ver</span>
                      </a>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReceiptUpload(expense.id, file);
                          }}
                          disabled={uploadingReceipt === expense.id}
                        />
                        <div className="flex items-center space-x-1 text-slate-600 hover:text-slate-900">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {uploadingReceipt === expense.id ? 'Subiendo...' : 'Subir'}
                          </span>
                        </div>
                      </label>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expenses.length === 0 && !showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No hay gastos registrados</p>
        </div>
      )}
    </div>
  );
}
