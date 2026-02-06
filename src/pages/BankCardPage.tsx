/**
 * 银行卡管理页面
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getBankList, getBankType, createBank, updateBank, deleteBank, Bank } from '@/lib/api/bank';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BankCardPage() {
  const navigate = useNavigate();
  const { isLoggedIn, userInfo } = useAuth();
  const { t } = useLanguage();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankTypes, setBankTypes] = useState<any[]>([]);
  const [walletTypes, setWalletTypes] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [formData, setFormData] = useState({
    bank_name: '',
    bank_no: '',
    bank_owner: '',
    bank_address: '',
    wallet_type: '' // 钱包类型：Omni、ERC20、TRC20
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isLoggedIn]);

  // useEffect(() => {
  //   if (formData.bank_name === 'USDT') {
  //     if(formData.bank_owner === '') {
  //       formData.bank_owner = userInfo.username || ''
  //       setFormData({ ...formData, bank_owner: userInfo.username || '' })
  //     }
  //   }else{
  //     // formData.bank_owner = ''
  //     // setFormData({ ...formData, bank_owner: '' })
  //   }
  // }, [formData]);
  

  const onBankNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // console.log('e.target.value',e.target.value);
    if(e.target.value === 'USDT' && formData.bank_owner === ''){
      // formData.bank_owner = userInfo.username || ''
      setFormData({ ...formData, bank_name: e.target.value, bank_owner: userInfo.username || '' })
    }else{
      setFormData({ ...formData, bank_name: e.target.value, bank_owner: '' });
    }
  };

  const loadData = async () => {
    try {
      const [banksRes, typesRes] = await Promise.all([
        getBankList(),
        getBankType()
      ]);
      if (banksRes.code === 200) setBanks(banksRes.data || []);
      if (typesRes.code === 200) {
        // 确保 bankTypes 始终是数组
        const bankTypeData = typesRes.data || [];
        if (Array.isArray(bankTypeData)) {
          setBankTypes(bankTypeData);
        } else if (typeof bankTypeData === 'object' && bankTypeData !== null) {
          // 如果是对象格式，转换为数组格式
          setBankTypes(Object.entries(bankTypeData).map(([value, label]) => ({ 
            value, 
            label: String(label) 
          })));
        } else {
          setBankTypes([]);
        }
        
        // 从接口响应中提取钱包类型（usdt 字段）
        if (typesRes.usdt && typeof typesRes.usdt === 'object') {
          // 将对象格式转换为数组格式
          // 例如: {omni: 'Omni', erc: 'ERC20', trc: 'TRC20'} => [{value: 'omni', label: 'Omni'}, ...]
          const walletTypeArray = Object.entries(typesRes.usdt).map(([value, label]) => ({
            value,
            label: String(label)
          }));
          setWalletTypes(walletTypeArray);
        } else {
          // 如果接口没有返回钱包类型，使用默认值
          setWalletTypes([
            { value: 'omni', label: 'Omni' },
            { value: 'erc', label: 'ERC20' },
            { value: 'trc', label: 'TRC20' }
          ]);
        }
      } else {
        setBankTypes([]);
        // 如果接口失败，使用默认值
        setWalletTypes([
          { value: 'omni', label: 'Omni' },
          { value: 'erc', label: 'ERC20' },
          { value: 'trc', label: 'TRC20' }
        ]);
      }
    } catch (err) {
      // 如果接口失败，使用默认值
      setBankTypes([]);
      setWalletTypes([
        { value: 'omni', label: 'Omni' },
        { value: 'erc', label: 'ERC20' },
        { value: 'trc', label: 'TRC20' }
      ]);
    }
  };

  const handleSubmit = async () => {
    try {
      // 转换字段名以匹配后端API
      const submitData = {
        bank_type: formData.bank_name,
        card_no: formData.bank_no,
        owner_name: formData.bank_owner,
        bank_address: formData.bank_address,
        wallet_type: formData.wallet_type
      };
      
      let res;
      if (editingBank) {
        res = await updateBank({ ...submitData, id: editingBank.id });
      } else {
        res = await createBank(submitData);
      }
      if (res.code === 200) {
        alert(editingBank ? t('updateSuccess') : t('addSuccess'));
        setShowAddForm(false);
        setEditingBank(null);
        setFormData({ bank_name: '', bank_no: '', bank_owner: '', bank_address: '', wallet_type: '' });
        loadData();
      } else {
        alert(res.message || t('operationFailed'));
      }
    } catch (err: any) {
      alert(err.message || t('operationFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDeleteBankCard'))) return;
    try {
      const res = await deleteBank(id);
      if (res.code === 200) {
        alert(t('deleteSuccess'));
        loadData();
      } else {
        alert(res.message || t('deleteFailed'));
      }
    } catch (err: any) {
      alert(err.message || t('deleteFailed'));
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0C1017', 
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      {/* PC端居中容器 */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)',
        minHeight: '100vh',
        background: '#0C1017'
      }}>
        {/* 返回按钮 */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <img 
          onClick={() => navigate(-1)} 
          src="https://www.xpj00000.vip/indexImg/icon_header_arrow.f02628bc.png" 
          alt="返回"
          style={{ 
            width: '24px', 
            height: '24px', 
            cursor: 'pointer',
            position: 'absolute',
            left: '20px'
          }} 
        />
        <h2 style={{ margin: 0, fontSize: '18px', flex: 1, textAlign: 'center' }}>{t('bankCardTitle')}</h2>
      </div>

      {/* 底部抽屉表单 */}
      {showAddForm && (
        <>
          {/* 遮罩层 */}
          <div
            onClick={() => {
              setShowAddForm(false);
              setEditingBank(null);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              WebkitAnimation: 'fadeIn 0.3s ease',
              animation: 'fadeIn 0.3s ease'
            }}
          />
          {/* 抽屉内容 */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#1a1f2e',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              zIndex: 10000,
              maxHeight: '90vh',
              overflowY: 'auto',
              WebkitAnimation: 'slideUp 0.3s ease',
              animation: 'slideUp 0.3s ease',
              WebkitTransform: 'translateY(0)',
              transform: 'translateY(0)'
            }}
          >
            {/* 深色头部 */}
            <div style={{
              background: '#1a1f2e',
              padding: '20px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>
                {t('bankCardChange')}
              </h2>
            </div>

            {/* 表单内容 */}
            <div style={{ padding: '20px', background: '#1a1f2e' }}>
              {/* 开户银行 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                  {t('bankName')}:
                </label>
                <select
                  value={formData.bank_name}
                  onChange={onBankNameChange}
                  title={t('selectBankName')}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23fff\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px 12px',
                    border: '1px solid rgba(199, 218, 255, 0.08)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="">{t('pleaseSelectBank')}</option>
                  {Array.isArray(bankTypes) && bankTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* 开户人姓名 */}
              {formData.bank_name && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                    {formData.bank_name=="USDT"? t('ownerName2') : t('ownerName')}:
                  </label>
                  <input
                    type="text"
                    value={formData.bank_owner}
                    onChange={(e) => setFormData({ ...formData, bank_owner: e.target.value })}
                    disabled={formData.bank_name=="USDT"}
                    placeholder={formData.bank_name=="USDT"? t('enterOwnerName2') : t('enterOwnerName')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(199, 218, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
              
                {/* 钱包地址 / 银行账号 */}
              {formData.bank_name && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                    {formData.bank_name && Array.isArray(bankTypes) && (bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('USDT') || bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('虚拟')) ? t('walletAddress') : t('bankAccount')}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_no}
                    onChange={(e) => setFormData({ ...formData, bank_no: e.target.value })}
                    placeholder={formData.bank_name && Array.isArray(bankTypes) && (bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('USDT') || bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('虚拟')) ? t('enterWalletAddress') : t('enterBankAccount')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(199, 218, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* 钱包类型（仅当选择USDT虚拟货币时显示） */}
              {(formData.bank_name && Array.isArray(bankTypes) && (bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('USDT') || bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('虚拟'))) && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                    {t('walletType')}
                  </label>
                  <select
                    value={formData.wallet_type}
                    onChange={(e) => setFormData({ ...formData, wallet_type: e.target.value })}
                    title={t('walletType')}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23fff\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '12px 12px',
                      border: '1px solid rgba(199, 218, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="">{t('pleaseSelectWalletType')}</option>
                    {Array.isArray(walletTypes) && walletTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 开户行（仅当选择普通银行时显示） */}
              {formData.bank_name && Array.isArray(bankTypes) && !(bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('USDT') || bankTypes.find(t => t.value === formData.bank_name)?.label?.includes('虚拟')) && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>
                    {t('bankBranch')}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_address}
                    onChange={(e) => setFormData({ ...formData, bank_address: e.target.value })}
                    placeholder={t('enterBankBranch')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(199, 218, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* 按钮 */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingBank(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#ffc53e',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 0 13px 0 rgba(255, 46, 0, 0.45), 0 0 10px 0 rgba(255, 46, 0, 0.25)'
                  }}
                >
                  {t('submit')}
                </button>
              </div>
            </div>
          </div>

          {/* 添加动画样式 */}
          <style>{`
            @-webkit-keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @-webkit-keyframes slideUp {
              from { -webkit-transform: translateY(100%); transform: translateY(100%); }
              to { -webkit-transform: translateY(0); transform: translateY(0); }
            }
            @keyframes slideUp {
              from { -webkit-transform: translateY(100%); transform: translateY(100%); }
              to { -webkit-transform: translateY(0); transform: translateY(0); }
            }
            /* 深色主题输入框 placeholder 样式 */
            input::placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            input::-webkit-input-placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            input::-moz-placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            input:-ms-input-placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            /* 深色主题下拉框选项样式 */
            select {
              color: #fff !important;
              background-color: rgba(0, 0, 0, 0.45) !important;
            }
            select option {
              background: #1a1f2e !important;
              color: #fff !important;
              padding: 10px;
            }
            select:focus {
              outline: none;
              border-color: #ffc53e;
              background-color: rgba(0, 0, 0, 0.45) !important;
            }
            select:focus option {
              background: #1a1f2e !important;
              color: #fff !important;
            }
            /* 移除浏览器默认的下拉箭头和背景 */
            select::-ms-expand {
              display: none;
            }
            select {
              -webkit-appearance: none;
              -moz-appearance: none;
              appearance: none;
            }
          `}</style>
        </>
      )}

      <div style={{ padding: '20px' }}>
        {banks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>{t('noBankCard')}</div>
        ) : (
          banks.map(bank => {
            // 判断是否为虚拟货币
            const isVirtual = bank.bank_name && (bank.bank_name.includes('USDT') || bank.bank_name.includes('虚拟'));
            const displayNo = bank.bank_no || bank.card_no || '';
            const displayName = bank.bank_name || bank.bank_type || '';
            const displayOwner = bank.bank_owner || bank.owner_name || '';
            
            // 隐藏卡号/地址中间部分，只显示前后几位
            const maskCardNo = (cardNo: string) => {
              if (!cardNo) return '';
              if (cardNo.length <= 8) {
                // 如果长度小于等于8，只显示前2位和后2位
                return cardNo.substring(0, 2) + '*'.repeat(cardNo.length - 4) + cardNo.substring(cardNo.length - 2);
              } else {
                // 显示前4位和后4位，中间用*代替
                return cardNo.substring(0, 4) + '*'.repeat(cardNo.length - 8) + cardNo.substring(cardNo.length - 4);
              }
            };
            
            // 持卡人只显示第一个字
            const maskOwner = (owner: string) => {
              if (!owner) return '';
              return owner.substring(0, 1) + '*';
            };
            
            return (
              <div
                key={bank.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '25px 20px',
                  marginBottom: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minHeight: '120px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {/* 银行名称 */}
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    {displayName}
                  </div>
                  
                  {/* 卡号/钱包地址 */}
                  <div style={{
                    fontSize: '16px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    letterSpacing: '1px'
                  }}>
                    {isVirtual ? t('address') + '：' : t('cardNumber') + '：'} {maskCardNo(displayNo)}
                  </div>
                  
                  {/* 钱包类型（如果是虚拟货币） */}
                  {isVirtual && bank.wallet_type && (
                    <div style={{
                      fontSize: '14px',
                      color: '#999'
                    }}>
                      {t('walletType')}: {bank.wallet_type}
                    </div>
                  )}
                  
                  {/* 持卡人姓名（只显示第一个字） */}
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginTop: 'auto'
                  }}>
                    {t('cardholder')}: {maskOwner(displayOwner)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 添加银行卡按钮 */}
      <div style={{ padding: '0 20px 20px', marginTop: '0' }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAddForm(true);
            setEditingBank(null);
            setFormData({ bank_name: '', bank_no: '', bank_owner: '', bank_address: '', wallet_type: '' });
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {t('addBankCard')}
        </button>
      </div>
      </div>
    </div>
  );
}

