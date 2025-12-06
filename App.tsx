import React, { useState, useRef, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { 
  ShoppingCart, LayoutDashboard, Package, ShoppingBag, 
  Trash2, Plus, Minus, X, Printer, Store, TrendingUp, AlertTriangle, User, Search, Sparkles, CreditCard, Banknote, CheckCircle, Truck, Download, Wallet, Building2, ChevronRight, Lock, ChevronDown, Receipt, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { generateProductDescription } from './services/geminiService';
import { Product, Order, CartItem, View, AdminView } from './types';

// --- Helper Components ---

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in scale-100 opacity-100">
      <div className="flex justify-between items-center p-5 border-b bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"><X size={20} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Invoice = ({ order, onClose }: { order: Order | null, onClose: () => void }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    const element = document.getElementById('invoice-content');
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
        alert('جاري تحميل مكتبة PDF، الرجاء المحاولة مرة أخرى...');
        return;
    }

    const opt = {
        margin: [10, 10],
        filename: `invoice-${order?.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  };

  if (!order) return null;

  if (!showPreview) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in no-print transition-all">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="bg-green-500 p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner ring-4 ring-white/10">
                        <CheckCircle className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-1 tracking-tight">تم الدفع بنجاح!</h2>
                    <p className="text-green-50 text-sm font-medium opacity-90">شكراً لثقتكم بالمتجر الذكي</p>
                </div>
            </div>
            
            <div className="p-6 sm:p-8 bg-white">
                {/* Summary Card */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                         <span className="text-gray-500 font-bold text-sm">المبلغ المدفوع</span>
                         <span className="text-2xl font-extrabold text-gray-900">{(order.total * 1.15).toLocaleString()} <span className="text-sm font-normal text-gray-500">ر.س</span></span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500 font-medium">رقم الطلب</span>
                            <span className="font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-100">#{order.id.slice(-6)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500 font-medium">العميل</span>
                            <span className="font-bold text-gray-800">{order.customerName}</span>
                        </div>
                         <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500 font-medium">عدد المنتجات</span>
                            <span className="font-bold text-gray-800 flex items-center gap-1">
                                {order.items.reduce((acc, item) => acc + item.quantity, 0)} <span className="text-xs font-normal text-gray-400">قطعة</span>
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mb-6">تم إرسال نسخة من الفاتورة إلى سجل الطلبات</p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => setShowPreview(true)}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Printer size={20} className="group-hover:scale-110 transition-transform" /> 
                        <span>عرض وطباعة الفاتورة</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all"
                    >
                        متابعة التسوق
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 overflow-auto">
        <div className="max-w-3xl mx-auto my-8 print:w-full print:my-0">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 px-4 sm:px-0 no-print">
                <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white px-4 py-2 rounded-full transition-all shadow-sm">
                    <X size={18} /> <span className="font-medium">إغلاق</span>
                </button>
                <div className="flex gap-3">
                    <button onClick={handleSave} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all font-medium">
                        <Download size={18} /> حفظ PDF
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-full hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all font-medium">
                        <Printer size={18} /> طباعة
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="bg-white p-8 sm:p-12 border print:border-0 shadow-xl print:shadow-none mx-4 sm:mx-0 rounded-3xl print:rounded-none" id="invoice-content">
                <div className="print-content" dir="rtl">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                        <div>
                             <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">المتجر الذكي</h1>
                             <p className="text-gray-500 font-medium">فاتورة ضريبية مبسطة</p>
                        </div>
                        <div className="text-left">
                            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">رقم الفاتورة</p>
                                <p className="font-bold text-lg text-gray-900">#{order.id.slice(-6)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">معلومات العميل</p>
                            <h3 className="text-xl font-bold text-gray-900">{order.customerName}</h3>
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">تاريخ الإصدار</p>
                            <p className="font-bold text-gray-900">{new Date(order.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(order.date).toLocaleTimeString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 overflow-hidden mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="py-4 px-6 text-start font-semibold">المنتج</th>
                                    <th className="py-4 px-6 text-center font-semibold">الكمية</th>
                                    <th className="py-4 px-6 text-center font-semibold">السعر</th>
                                    <th className="py-4 px-6 text-end font-semibold">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
                                        <td className="py-4 px-6 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-4 px-6 text-center text-gray-600">{item.price.toLocaleString()} ر.س</td>
                                        <td className="py-4 px-6 text-end font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} ر.س</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-72 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex justify-between mb-3 text-gray-600">
                                <span className="font-medium">المجموع الفرعي</span>
                                <span>{order.total.toLocaleString()} ر.س</span>
                            </div>
                            <div className="flex justify-between mb-4 text-gray-600">
                                <span className="font-medium">الضريبة (15%)</span>
                                <span>{(order.total * 0.15).toLocaleString()} ر.س</span>
                            </div>
                            <div className="border-t border-gray-200 my-4"></div>
                            <div className="flex justify-between font-extrabold text-2xl text-primary-700">
                                <span>الإجمالي</span>
                                <span>{(order.total * 1.15).toLocaleString()} ر.س</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-900 font-bold mb-2">شكراً لتعاملكم معنا!</p>
                        <p className="text-sm text-gray-500">المتجر الذكي - المملكة العربية السعودية</p>
                        <p className="text-xs text-gray-400 mt-2 font-mono">{order.id}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Sub Components ---

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useStore();
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group">
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
             <AlertTriangle size={12} /> <span>كمية محدودة</span>
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-6">نفد المخزون</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-primary-600 transition-colors">{product.name}</h3>
            <span className="font-extrabold text-primary-600 text-lg whitespace-nowrap">{product.price} <span className="text-xs font-normal">ر.س</span></span>
        </div>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
        <button 
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm
            ${product.stock > 0 
              ? 'bg-gray-900 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-600/25 active:scale-95' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <ShoppingCart size={18} />
          {product.stock > 0 ? 'أضف للسلة' : 'غير متوفر'}
        </button>
      </div>
    </div>
  );
};

const CartPage = ({ onCheckout, onContinueShopping }: { onCheckout: (name: string) => void, onContinueShopping: () => void }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState('');
  
  // Payment State
  const [activeMethod, setActiveMethod] = useState<'card' | null>('card');
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = total * 1.15; // Including tax

  const processPayment = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
  };

  const handleCheckout = async (method: 'card' | 'cash' | 'cod' | 'wallet' | 'bank') => {
    setError('');
    
    if (!customerName.trim()) {
        setError('الرجاء إدخال اسم العميل');
        return;
    }
    
    if (method === 'card') {
        if (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv) {
            setError('الرجاء إدخال جميع بيانات البطاقة');
            return;
        }
    }

    setIsProcessing(true);
    
    try {
        await processPayment();
        onCheckout(customerName);
        setCustomerName('');
        setCardInfo({ number: '', expiry: '', cvv: '' });
        setActiveMethod('card');
        setError('');
    } catch (e) {
        setError('حدث خطأ في عملية الدفع');
    } finally {
        setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
             <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                <ShoppingBag size={80} className="opacity-20 text-gray-600" />
                <span className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md">
                     <AlertTriangle className="text-orange-400" size={24} />
                </span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3 text-center">سلة المشتريات فارغة</h2>
            <p className="text-gray-500 max-w-md text-center text-lg mb-8">لم تقم بإضافة أي منتجات للسلة بعد. تصفح المتجر واكتشف عروضنا المميزة.</p>
            <button 
                onClick={onContinueShopping} 
                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-xl shadow-gray-900/10 flex items-center gap-3 text-lg"
            >
                <Store size={22} />
                تصفح المنتجات
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
            <button onClick={onContinueShopping} className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition shadow-sm">
                <ArrowRight size={20} />
            </button>
            <h1 className="text-3xl font-extrabold text-gray-800">إتمام الطلب</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-primary-600" />
                            المنتجات في السلة <span className="text-gray-400 text-sm font-normal">({cart.length})</span>
                        </h2>
                        <button onClick={clearCart} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2">
                             <Trash2 size={16} /> إفراغ السلة
                        </button>
                     </div>

                     <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl border border-gray-100 hover:border-primary-100 transition-all bg-gray-50/30">
                                <div className="w-full sm:w-32 h-32 bg-white rounded-xl p-2 border border-gray-100 shadow-sm flex-shrink-0">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                                            <p className="text-gray-500 text-sm">{item.category}</p>
                                        </div>
                                        <p className="font-extrabold text-xl text-primary-600 whitespace-nowrap">{item.price * item.quantity} <span className="text-sm text-gray-400 font-normal">ر.س</span></p>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-4">
                                         <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
                                            <button 
                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-bold w-6 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-black transition disabled:opacity-50"
                                                disabled={item.quantity >= item.stock}
                                            >
                                                <Plus size={16} />
                                            </button>
                                         </div>
                                         <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                                            <Trash2 size={16} /> حذف
                                         </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
            </div>

            {/* Summary & Payment */}
            <div className="lg:col-span-1 space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">ملخص الطلب</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>المجموع الفرعي</span>
                            <span className="font-bold">{total.toLocaleString()} ر.س</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>الضريبة (15%)</span>
                            <span className="font-bold">{(total * 0.15).toLocaleString()} ر.س</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-4 pt-4 flex justify-between items-center">
                             <span className="font-bold text-lg text-gray-900">الإجمالي الكلي</span>
                             <span className="font-extrabold text-2xl text-primary-600">{finalTotal.toLocaleString()} <span className="text-sm font-normal text-gray-500">ر.س</span></span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">معلومات العميل</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={customerName} 
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    if(error) setError('');
                                }} 
                                placeholder="الاسم بالكامل"
                                className={`w-full pr-10 pl-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition font-medium
                                ${error && !customerName ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'}`}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-100 animate-slide-up">
                            <AlertTriangle size={20} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">طريقة الدفع</h2>
                    
                    <div className="space-y-3 mb-6">
                         {/* Card Option */}
                        <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${activeMethod === 'card' ? 'border-primary-500 bg-primary-50/10 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'}`}>
                            <button 
                                onClick={() => setActiveMethod(activeMethod === 'card' ? null : 'card')}
                                className="w-full flex items-center justify-between p-4 bg-transparent"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white border border-gray-200 p-2 rounded-full text-primary-600 shadow-sm">
                                        <CreditCard size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800">بطاقة ائتمان</span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeMethod === 'card' ? 'border-primary-600' : 'border-gray-300'}`}>
                                    {activeMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>}
                                </div>
                            </button>
                            
                            {activeMethod === 'card' && (
                                <div className="px-4 pb-4 pt-0 space-y-4 animate-fade-in">
                                    <div className="h-px bg-primary-100 mb-4 mx-2"></div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-600 mb-1 block">رقم البطاقة</label>
                                            <input 
                                                type="text" 
                                                placeholder="0000 0000 0000 0000"
                                                value={cardInfo.number}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                                    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                    setCardInfo({...cardInfo, number: val});
                                                }}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-left dir-ltr bg-white"
                                                style={{direction: 'ltr'}}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-600 mb-1 block">MM/YY</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="MM/YY"
                                                    value={cardInfo.expiry}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                        if(val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                                                        setCardInfo({...cardInfo, expiry: val});
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-center bg-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-600 mb-1 block">CVC</label>
                                                <input 
                                                    type="password" 
                                                    placeholder="123"
                                                    value={cardInfo.cvv}
                                                    onChange={e => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-center bg-white"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleCheckout('card')}
                                            disabled={isProcessing}
                                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg mt-2 flex justify-center"
                                        >
                                            {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'دفع الآن'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Payment Grid */}
                        <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => handleCheckout('cod')}
                                disabled={isProcessing}
                                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all group bg-white"
                            >
                                <Truck size={24} className="text-gray-400 group-hover:text-blue-600 mb-2 transition-colors" />
                                <span className="font-bold text-sm text-gray-700">الدفع عند الاستلام</span>
                            </button>
                            <button 
                                onClick={() => handleCheckout('cash')}
                                disabled={isProcessing}
                                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-2xl hover:bg-green-50 hover:border-green-500 hover:shadow-md transition-all group bg-white"
                            >
                                <Banknote size={24} className="text-gray-400 group-hover:text-green-600 mb-2 transition-colors" />
                                <span className="font-bold text-sm text-gray-700">نقداً (Cash)</span>
                            </button>
                            <button 
                                onClick={() => handleCheckout('wallet')}
                                disabled={isProcessing}
                                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-2xl hover:bg-purple-50 hover:border-purple-500 hover:shadow-md transition-all group bg-white"
                            >
                                <Wallet size={24} className="text-gray-400 group-hover:text-purple-600 mb-2 transition-colors" />
                                <span className="font-bold text-sm text-gray-700">محفظة رقمية</span>
                            </button>
                            <button 
                                onClick={() => handleCheckout('bank')}
                                disabled={isProcessing}
                                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-2xl hover:bg-orange-50 hover:border-orange-500 hover:shadow-md transition-all group bg-white"
                            >
                                <Building2 size={24} className="text-gray-400 group-hover:text-orange-600 mb-2 transition-colors" />
                                <span className="font-bold text-sm text-gray-700">تحويل بنكي</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Pages ---

const StoreFront = ({ onGoToCart }: { onGoToCart: () => void }) => {
  const { products, cart } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(p => 
    (categoryFilter === 'All' || p.category === categoryFilter) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto relative min-h-[80vh]">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800">المنتجات المميزة</h1>
            <p className="text-gray-500 mt-1">تصفح أحدث المنتجات وأضفها لسلتك</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="بحث عن منتج..." 
                    className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {categories.map(cat => (
            <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all
                ${categoryFilter === cat ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'}`}
            >
                {cat === 'All' ? 'الكل' : cat}
            </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-400 text-lg font-medium">لا توجد منتجات تطابق بحثك</p>
              <button onClick={() => {setCategoryFilter('All'); setSearchTerm('')}} className="mt-4 text-primary-600 font-bold hover:underline">عرض كل المنتجات</button>
          </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 animate-bounce-subtle">
            <button 
                onClick={onGoToCart}
                className="bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform border border-gray-700 hover:bg-black"
            >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                </span>
                <span className="font-bold">إتمام الطلب</span>
                <div className="bg-white/20 px-2 py-0.5 rounded-md text-sm font-mono text-white">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
            </button>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { products, orders, stats, addProduct, deleteProduct, updateProduct, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<AdminView>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, category: '', stock: 0, description: '', imageUrl: 'https://picsum.photos/200' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDesc = async () => {
    if (!newProduct.name || !newProduct.category) return alert("يرجى إدخال الاسم والتصنيف أولاً");
    setIsGenerating(true);
    const desc = await generateProductDescription(newProduct.name, newProduct.category);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleAddProduct = () => {
    if(!newProduct.name || !newProduct.price) return;
    addProduct({
        id: Date.now().toString(),
        name: newProduct.name!,
        price: Number(newProduct.price),
        category: newProduct.category || 'عام',
        stock: Number(newProduct.stock),
        description: newProduct.description || '',
        imageUrl: newProduct.imageUrl || 'https://picsum.photos/200'
    } as Product);
    setShowAddModal(false);
    setNewProduct({ name: '', price: 0, category: '', stock: 0, description: '', imageUrl: 'https://picsum.photos/200' });
  };

  // Prepare chart data
  const chartData = orders.slice(0, 10).map(o => ({
      name: new Date(o.date).toLocaleDateString('ar-EG'),
      total: o.total
  })).reverse();

  const getStatusStyles = (status: string) => {
    switch(status) {
        case 'completed': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
        case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-800">لوحة التحكم</h1>
        <div className="bg-white p-1.5 rounded-xl border border-gray-200 flex shadow-sm">
            <button onClick={() => setActiveTab('dashboard')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>نظرة عامة</button>
            <button onClick={() => setActiveTab('inventory')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>المخزون</button>
            <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>الطلبات</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">إجمالي المبيعات</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalSales.toLocaleString()} <span className="text-sm font-normal text-gray-500">ر.س</span></h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={24} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">عدد الطلبات</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalOrders}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Package size={24} /></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">نواقص المخزون</p>
                            <h3 className="text-3xl font-extrabold text-orange-600">{stats.lowStockCount}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><AlertTriangle size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-96">
                <h3 className="font-bold text-xl text-gray-800 mb-6">أداء المبيعات</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            cursor={{fill: '#f9fafb'}}
                        />
                        <Bar dataKey="total" fill="#16a34a" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-xl text-gray-800">قائمة المنتجات</h3>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-gray-900/20 font-bold text-sm">
                    <Plus size={18} /> إضافة منتج
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">المنتج</th>
                            <th className="px-6 py-4">السعر</th>
                            <th className="px-6 py-4">التصنيف</th>
                            <th className="px-6 py-4">المخزون</th>
                            <th className="px-6 py-4">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                                    <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                    {p.name}
                                </td>
                                <td className="px-6 py-4 font-medium">{p.price} ر.س</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{p.category}</span></td>
                                <td className={`px-6 py-4 font-bold ${p.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${p.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                        {p.stock}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 bg-white">
                <h3 className="font-bold text-xl text-gray-800">سجل الطلبات</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">رقم الطلب</th>
                            <th className="px-6 py-4">العميل</th>
                            <th className="px-6 py-4">التاريخ</th>
                            <th className="px-6 py-4">الإجمالي</th>
                            <th className="px-6 py-4">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {orders.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">لا توجد طلبات حتى الآن</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.customerName}</td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(order.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.total.toLocaleString()} ر.س</td>
                                    <td className="px-6 py-4">
                                      <div className="relative inline-block group">
                                          <select 
                                              value={order.status} 
                                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                              className={`appearance-none pl-8 pr-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all shadow-sm ${getStatusStyles(order.status)}`}
                                          >
                                              <option value="pending">قيد الانتظار</option>
                                              <option value="completed">مكتمل</option>
                                              <option value="shipped">تم الشحن</option>
                                              <option value="cancelled">ملغي</option>
                                          </select>
                                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-current opacity-60">
                                              <ChevronDown size={14} />
                                          </div>
                                      </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <Modal title="إضافة منتج جديد" onClose={() => setShowAddModal(false)}>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنتج</label>
                    <input type="text" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="مثال: ساعة ذكية" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">السعر</label>
                        <input type="number" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الكمية</label>
                        <input type="number" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                    <input type="text" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="إلكترونيات، ملابس..." />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700">الوصف</label>
                        <button onClick={handleGenerateDesc} disabled={isGenerating} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1 hover:bg-purple-100 transition font-bold">
                            <Sparkles size={12} /> {isGenerating ? 'جاري التوليد...' : 'توليد ذكي'}
                        </button>
                    </div>
                    <textarea className="w-full border border-gray-300 rounded-xl p-3 h-28 focus:ring-2 focus:ring-primary-500 outline-none transition resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="وصف المنتج..." />
                </div>
                <button onClick={handleAddProduct} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg">حفظ المنتج</button>
            </div>
        </Modal>
      )}
    </div>
  );
};

const MainLayout = () => {
    const [view, setView] = useState<View>('store');
    const { cart, createOrder } = useStore();
    const [lastOrder, setLastOrder] = useState<Order | null>(null);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = (name: string) => {
        const order = createOrder(name);
        setLastOrder(order);
        setView('store'); // Return to store after checkout
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm no-print backdrop-blur-md bg-white/90">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('store')}>
                        <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-lg shadow-gray-900/20 group-hover:scale-105 transition duration-300">
                            <Store size={26} />
                        </div>
                        <span className="font-extrabold text-2xl text-gray-900 tracking-tight">المتجر الذكي</span>
                    </div>

                    <div className="flex items-center gap-8 bg-gray-50 px-6 py-2 rounded-full border border-gray-100 hidden md:flex">
                        <button 
                            onClick={() => setView('store')}
                            className={`font-bold text-sm transition-all duration-300 relative px-2 ${view === 'store' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            الرئيسية
                            {view === 'store' && <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-600 rounded-full"></span>}
                        </button>
                         <button 
                            onClick={() => setView('cart')}
                            className={`font-bold text-sm transition-all duration-300 relative px-2 ${view === 'cart' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            السلة
                            {view === 'cart' && <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-600 rounded-full"></span>}
                        </button>
                        <button 
                            onClick={() => setView('admin')}
                            className={`font-bold text-sm transition-all duration-300 relative px-2 ${view === 'admin' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            الإدارة
                            {view === 'admin' && <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-600 rounded-full"></span>}
                        </button>
                    </div>

                    <div className="flex items-center gap-5">
                         {/* Cart Icon in Header */}
                        <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition" onClick={() => setView('cart')}>
                            <ShoppingBag size={24} className={view === 'cart' ? 'text-primary-600' : 'text-gray-600'} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200">
                            <User size={20} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="no-print animate-fade-in pb-10">
                {view === 'store' && <StoreFront onGoToCart={() => setView('cart')} />}
                {view === 'admin' && <AdminDashboard />}
                {view === 'cart' && <CartPage onCheckout={handleCheckout} onContinueShopping={() => setView('store')} />}
            </main>

            {/* Invoice Overlay */}
            <Invoice order={lastOrder} onClose={() => setLastOrder(null)} />
        </div>
    );
}

const App = () => {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
};

export default App;