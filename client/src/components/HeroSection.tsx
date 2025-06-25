import { Shield, Coins, Users } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="text-center py-12 mb-12">
      <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
        Fantasy Football on Blockchain
      </h2>
      <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
        Draft your dream team, compete with others, and win CHZ tokens in decentralized fantasy football tournaments.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <div className="flex items-center space-x-2 text-slate-300">
          <Shield className="h-5 w-5 text-accent-green" />
          <span>Secure Smart Contracts</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Coins className="h-5 w-5 text-accent-green" />
          <span>CHZ Token Rewards</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <Users className="h-5 w-5 text-accent-green" />
          <span>Community Driven</span>
        </div>
      </div>
    </section>
  );
}
