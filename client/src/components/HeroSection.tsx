import { Trophy, Zap, Users, Target, Gamepad2, Crown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-green rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-blue rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-accent-purple rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-green via-accent-blue to-accent-purple rounded-2xl flex items-center justify-center animate-glow floating">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-accent-orange rounded-full flex items-center justify-center animate-bounce">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-accent-green via-accent-blue to-accent-purple bg-clip-text text-[#eceef0]">
              FanDraft
            </span>
            <br />
            <span className="text-slate-50 text-4xl md:text-5xl">SportFi Revolution</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate <span className="text-accent-green font-semibold">decentralized fantasy football</span> platform. 
            Create your dream team, compete with others, and win <span className="text-accent-blue font-semibold">CHZ tokens</span> on the Chiliz blockchain.
          </p>
          
          <div className="flex justify-center space-x-2 mb-12">
            <div className="px-4 py-2 bg-accent-green/20 rounded-full text-accent-green font-semibold text-sm">
              🔥 Live on Chiliz
            </div>
            <div className="px-4 py-2 bg-accent-blue/20 rounded-full text-accent-blue font-semibold text-sm">
              ⚡ Instant Rewards
            </div>
            <div className="px-4 py-2 bg-accent-purple/20 rounded-full text-accent-purple font-semibold text-sm">
              🏆 Competitive Gaming
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="draft-card p-6 rounded-2xl text-center hover-lift">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-50 mb-3">Compete & Conquer</h3>
            <p className="text-slate-400 leading-relaxed">Join exclusive drafts and battle for massive CHZ token prizes in our skill-based tournaments</p>
          </div>
          
          <div className="draft-card p-6 rounded-2xl text-center hover-lift">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-50 mb-3">Blockchain Powered</h3>
            <p className="text-slate-400 leading-relaxed">100% transparent and secure smart contracts on Chiliz network with instant payouts</p>
          </div>
          
          <div className="draft-card p-6 rounded-2xl text-center hover-lift">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-50 mb-3">Elite Gaming</h3>
            <p className="text-slate-400 leading-relaxed">Join a global community of strategic football fans in next-gen SportFi competitions</p>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 rounded-full border border-accent-green/20">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span className="text-slate-300 font-medium">Real-time blockchain gaming experience</span>
          </div>
        </div>
      </div>
    </section>
  );
}
