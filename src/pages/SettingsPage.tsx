import React, { useState } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useToastStore } from '../stores/useToastStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { sound } from '../utils/audio';
import { 
  Store, 
  Receipt, 
  Moon, 
  Sun, 
  Volume2, 
  RotateCcw, 
  Save, 
  Laptop,
  Check,
  Percent
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, setTheme, toggleAudio, resetToDefaults } = useSettingsStore();
  const { showToast } = useToastStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [branchName, setBranchName] = useState(settings.branchName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [taxId, setTaxId] = useState(settings.taxId);
  const [vatRate, setVatRate] = useState(settings.vatRate.toString());
  const [vatIncluded, setVatIncluded] = useState(settings.vatIncluded);
  const [headerMsg, setHeaderMsg] = useState(settings.receiptHeaderMessage);
  const [footerMsg, setFooterMsg] = useState(settings.receiptFooterMessage);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      branchName,
      address,
      phone,
      taxId,
      vatRate: parseFloat(vatRate) || 0,
      vatIncluded,
      receiptHeaderMessage: headerMsg,
      receiptFooterMessage: footerMsg
    });

    sound.playSuccess();
    showToast({ type: 'success', title: 'Settings Saved', message: 'All changes successfully applied' });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all mock data to factory defaults?')) {
      localStorage.clear();
      resetToDefaults();
      sound.playSuccess();
      showToast({ type: 'warning', title: 'Reset Complete', message: 'Reloading application...' });
      setTimeout(() => window.location.reload(), 600);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 lg:p-8 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Store & POS Settings
          </h2>
          <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
            Configure store profile, thermal receipt templates, tax rates and appearance
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Information */}
        <div className="p-6 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <Store className="w-4 h-4 text-[#8B6F5A]" />
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
              Store Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Café Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Northline Café"
              required
            />
            <Input
              label="Branch Name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Siam Square Flagship"
            />
          </div>

          <Input
            label="Store Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address for receipts"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="02-123-4567"
            />
            <Input
              label="Tax Identification Number (Tax ID)"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="0105565012345"
            />
          </div>
        </div>

        {/* Section 2: Taxes & Receipts */}
        <div className="p-6 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <Receipt className="w-4 h-4 text-[#0071E3]" />
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
              Tax & Thermal Receipt Template
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="VAT Percentage (%)"
              type="number"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              placeholder="7"
            />

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 p-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04] cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={vatIncluded}
                  onChange={(e) => setVatIncluded(e.target.checked)}
                  className="rounded text-[#8B6F5A] focus:ring-[#8B6F5A]"
                />
                <span>Prices are inclusive of VAT (7%)</span>
              </label>
            </div>
          </div>

          <Input
            label="Receipt Sub-Header Message"
            value={headerMsg}
            onChange={(e) => setHeaderMsg(e.target.value)}
            placeholder="Specialty Coffee & Artisanal Pastries"
          />

          <Input
            label="Receipt Footer Message"
            value={footerMsg}
            onChange={(e) => setFooterMsg(e.target.value)}
            placeholder="Thank you for visiting Northline Café"
          />
        </div>

        {/* Section 3: System Appearance & Audio */}
        <div className="p-6 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <Moon className="w-4 h-4 text-[#8B6F5A]" />
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
              Appearance & Tactile Feedback
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'Auto', icon: Laptop }
                ].map((t) => {
                  const Icon = t.icon;
                  const isSel = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setTheme(t.id as 'light' | 'dark' | 'system');
                      }}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[12px] text-xs font-semibold border transition-all ${
                        isSel
                          ? 'bg-[#8B6F5A]/10 border-[#8B6F5A] text-[#1D1D1F] dark:text-white ring-1 ring-[#8B6F5A]'
                          : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/10 text-[#6E6E73]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D] mb-2">
                Audio Synthesizer
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.04]">
                <span className="text-xs font-semibold">Sound Effects</span>
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all ${
                    settings.enableAudio
                      ? 'bg-[#34C759] text-white'
                      : 'bg-black/10 dark:bg-white/10 text-[#6E6E73]'
                  }`}
                >
                  {settings.enableAudio ? 'Enabled' : 'Muted'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Data Management */}
        <div className="p-6 rounded-[20px] bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
              Factory Reset Demo Data
            </h4>
            <p className="text-xs text-[#6E6E73] dark:text-[#98989D]">
              Clear local cached storage and restore all initial demo products & orders
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleResetData}
          >
            Reset Database
          </Button>
        </div>
      </form>
    </div>
  );
};
