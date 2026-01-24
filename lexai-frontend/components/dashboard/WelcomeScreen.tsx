"use client";

import React from 'react';
import { ShieldCheck, ArrowRight, Sparkles, FileCheck, Zap } from 'lucide-react';
import '@/styles/components/welcome-screen.css';

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="welcome">
      <div className="welcome__container">
        
        {/* Hero Section */}
        <div className="welcome__hero">
          <div className="welcome__icon-wrapper">
            <ShieldCheck className="welcome__icon" />
          </div>
          
          <h1 className="welcome__title">
            Welcome to <span className="welcome__title-highlight">LexAI</span>
          </h1>
          
          <p className="welcome__subtitle">
            Your AI-powered contract intelligence agent that automates compliance reviews and validates business contracts against internal policies in seconds.
          </p>
        </div>

        {/* Features Grid */}
        <div className="welcome__features">
          <FeatureCard 
            icon={<Sparkles className="feature-card__icon feature-card__icon--blue" />}
            iconBg="feature-card__icon-wrapper--blue"
            title="AI-Powered Analysis"
            desc="Extract critical data and identify risks using advanced AI technology."
          />
          <FeatureCard 
            icon={<FileCheck className="feature-card__icon feature-card__icon--green" />}
            iconBg="feature-card__icon-wrapper--green"
            title="Policy Validation"
            desc="Automatically flag violations against your company's ground truth policies."
          />
          <FeatureCard 
            icon={<Zap className="feature-card__icon feature-card__icon--purple" />}
            iconBg="feature-card__icon-wrapper--purple"
            title="Lightning Fast"
            desc="Get comprehensive contract audits in seconds, not hours."
          />
        </div>

        {/* CTA Section */}
        <div className="welcome__cta">
          <button onClick={onNext} className="welcome__cta-btn">
            Get Started
            <ArrowRight className="welcome__cta-btn-icon" />
          </button>
          
          <p className="welcome__cta-hint">
            Click &quot;Get Started&quot; to access the AI chatbot workspace
          </p>
        </div>

      </div>
    </div>
  );
};

// Sub-component for feature cards
interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}

const FeatureCard = ({ icon, iconBg, title, desc }: FeatureCardProps) => (
  <div className="feature-card">
    <div className="feature-card__content">
      <div className={`feature-card__icon-wrapper ${iconBg}`}>
        {icon}
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{desc}</p>
    </div>
  </div>
);