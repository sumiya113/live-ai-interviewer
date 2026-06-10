import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles, Zap, Building, Users, Star, ArrowRight } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  ctaText: string;
  popular: boolean;
  color: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free Starter',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring basic live voice interviews and core model feedback metrics.',
    icon: Star,
    features: [
      '2 Full Mock Interviews per month',
      'Standard Gemini 2.5 voice models',
      'Static question checklists',
      'Text responses transcript history',
      'Basic skill breakdown checklist (CSV)'
    ],
    ctaText: 'Current Plan',
    popular: false,
    color: 'border-gray-700 bg-gray-800/40 text-gray-400'
  },
  {
    name: 'Pro Coach',
    price: '$19',
    period: 'per month',
    description: 'Our most popular plan. Elevate your readiness with video analytics and unlimited AI sessions.',
    icon: Sparkles,
    features: [
      'Unlimited Live Audio/Video Interviews',
      'Dynamic Gemini 1.5 & 2.5 Flash models',
      'Custom Resume & Job Description uploads',
      'Real-time Eye contact and Posture analysis',
      'Synchronized Speech-to-Text transcript',
      'Dedicated Zephyr AI Career Coach guidance',
      'Interactive Recharts metrics and progression charts'
    ],
    ctaText: 'Upgrade to Pro',
    popular: true,
    color: 'border-indigo-500 bg-gradient-to-br from-indigo-950/20 to-gray-800 text-white'
  },
  {
    name: 'Team Recruiter',
    price: '$79',
    period: 'per month',
    description: 'Ideal for organizations and recruitment agencies looking to filter top candidates fast.',
    icon: Users,
    features: [
      'Everything in Pro Coach plan',
      'Support up to 10 active seat-licenses',
      'Centralized admin dashboard controls',
      'Custom question bank database uploads',
      'Candidate comparison matrices',
      'Fully customizable evaluation templates',
      'Priority ticketing support SLAs'
    ],
    ctaText: 'Start Team Trial',
    popular: false,
    color: 'border-gray-700 bg-gray-800/40 text-gray-300'
  },
  {
    name: 'Enterprise Apex',
    price: 'Custom',
    period: 'yearly billing',
    description: 'Enterprise grade scaling, advanced fallback strategies, custom LLM fine-tuning.',
    icon: Building,
    features: [
      'Everything in Team Recruiter',
      'Unlimited seat licenses',
      'Custom LLM prompt fine-tuning pipelines',
      'Dedicated private database clusters',
      'Strict SOC2 Compliance & data isolation',
      'Single Sign-On (SSO / SAML)',
      'Quarterly system efficiency reports'
    ],
    ctaText: 'Contact Enterprise Sales',
    popular: false,
    color: 'border-gray-700 bg-gray-800/40 text-gray-300'
  }
];

export const SaasPricing: React.FC = () => {
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annually'>('monthly');
  const [showModal, setShowModal] = useState(false);
  const [modalTier, setModalTier] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckout = (tierName: string) => {
    if (tierName === 'Free Starter') return;
    setModalTier(tierName);
    setShowModal(true);
    setSuccess(false);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Pricing Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Simple, Transparent Pro Architecture Pricing
        </h2>
        <p className="text-gray-400 text-sm">
          Level up your career today. Choose the plan matching your current career readiness. Upgrade or cancel anytime.
        </p>
        
        {/* Billing Switcher */}
        <div className="pt-4 flex justify-center items-center">
          <div className="relative bg-gray-800 p-1 rounded-xl flex border border-gray-700">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${selectedBilling === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setSelectedBilling('annually')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${selectedBilling === 'annually' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <span>Annually Billing</span>
              <span className="bg-green-500/10 text-green-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-green-500/20">Save 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_TIERS.map((tier, index) => {
          const IconComponent = tier.icon;
          const displayPrice = selectedBilling === 'annually' && tier.price !== 'Custom' && tier.price !== '$0'
            ? `$${Math.round(parseInt(tier.price.replace('$', '')) * 0.8)}`
            : tier.price;

          return (
            <div
              key={index}
              className={`relative rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-indigo-500/10 ${tier.color} ${
                tier.popular ? 'ring-2 ring-indigo-500 shadow-xl' : 'shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-1/2 translate-y-[-50%] translate-x-[50%] bg-indigo-500 text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-indigo-400">{tier.name}</span>
                  <div className={`p-2 rounded-xl ${tier.popular ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-white">{displayPrice}</span>
                  <span className="text-xs text-gray-400">{tier.price === 'Custom' ? '' : `/ ${tier.period}`}</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed min-h-[48px]">{tier.description}</p>

                <div className="border-t border-gray-700/50 pt-4 space-y-2.5">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Features included:</div>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={tier.ctaText === 'Current Plan'}
                  onClick={() => handleCheckout(tier.name)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    tier.ctaText === 'Current Plan'
                      ? 'bg-gray-800 border border-gray-700 text-gray-500 cursor-default'
                      : tier.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                      : 'bg-gray-900 hover:bg-gray-850 border border-gray-700 hover:border-gray-600 text-white'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  {tier.ctaText !== 'Current Plan' && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Checkout Modal Sandbox */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6 space-y-6 relative animate-scaleIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mx-auto scale-105 transition-all animate-bounce">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Payment Authorized Successfully!</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Stripe Subscription Registered. Welcome to **InterviewForge Pro**. Triggering model access permissions...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="text-indigo-400 w-5 h-5" />
                    Stripe Pro Secure Checkout
                  </h3>
                  <p className="text-xs text-gray-400">Upgrading organization access to **{modalTier}**</p>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Card Details</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        className="bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none flex-grow"
                      />
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.replace(/[^\d/]/g, ''))}
                        className="bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none w-14 text-center"
                      />
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/[^\d]/g, ''))}
                        className="bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none w-10 text-center"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Secure mock checkout using sandbox Stripe elements. Your personal banking coordinates are never saved.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Submit Payment Authorization</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaasPricing;
