import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🎨",
      title: "Draw & Calculate",
      description: "Simply draw your mathematical expressions on our intuitive canvas and get instant results.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📚", 
      title: "Step-by-Step Solutions",
      description: "Enable our advanced mode to see detailed breakdowns of complex calculus and algebra problems.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: "🧮",
      title: "Multi-Subject Support", 
      description: "From basic arithmetic to advanced calculus, algebra, and geometry - we've got you covered.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: "⚡",
      title: "AI-Powered Recognition",
      description: "Advanced AI technology recognizes your handwritten math and provides accurate solutions instantly.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: "📱",
      title: "Cross-Platform",
      description: "Works seamlessly on desktop, tablet, and mobile devices with touch and mouse support.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: "🎯",
      title: "Educational Focus",
      description: "Not just answers - learn the methodology and understand the mathematical reasoning behind each solution.",
      color: "from-violet-500 to-purple-500"
    }
  ];

  const problemTypes = [
    { name: "Calculus", icon: "∫", examples: ["Derivatives", "Integrals", "Limits"], color: "purple" },
    { name: "Algebra", icon: "𝑥", examples: ["Equations", "Systems", "Factoring"], color: "emerald" },
    { name: "Geometry", icon: "△", examples: ["Area", "Volume", "Angles"], color: "blue" },
    { name: "Arithmetic", icon: "+", examples: ["Basic Ops", "Fractions", "Decimals"], color: "orange" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">N</span>
            </div>
            <h1 className="text-2xl font-bold text-white">NeuroMath</h1>
          </div>
          <Button 
            onClick={() => navigate('/calculate')}
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Calculating
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto text-center">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-300 text-sm font-medium">AI-Powered Mathematical Assistant</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Draw Math,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Get Solutions
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your mathematical expressions into instant solutions with our revolutionary 
              AI-powered drawing calculator. From basic arithmetic to advanced calculus.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                onClick={() => navigate('/calculate')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 h-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Start Drawing
              </Button>
              <Button 
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">∞</div>
                <div className="text-gray-400 text-sm">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">4+</div>
                <div className="text-gray-400 text-sm">Math Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">AI</div>
                <div className="text-gray-400 text-sm">Powered Engine</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Types */}
      <section className="px-4 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Supports All Math Subjects
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              From elementary arithmetic to university-level calculus, our AI recognizes and solves problems across all mathematical disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemTypes.map((type, index) => (
              <div key={index} className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <div className={`w-12 h-12 bg-${type.color}-500/20 rounded-xl flex items-center justify-center mb-4`}>
                  <span className={`text-2xl text-${type.color}-400`}>{type.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{type.name}</h3>
                <div className="space-y-1">
                  {type.examples.map((example, i) => (
                    <div key={i} className="text-gray-400 text-sm">• {example}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Powerful Features for Every Student
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover the advanced capabilities that make NeuroMath the ultimate mathematical companion for students, teachers, and professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl" 
                     style={{backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Get from problem to solution in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. Draw</h3>
              <p className="text-gray-400">Write your mathematical expression naturally on our digital canvas using mouse or touch</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. Analyze</h3>
              <p className="text-gray-400">Our AI recognizes your handwriting and understands the mathematical context instantly</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Solve</h3>
              <p className="text-gray-400">Get instant solutions with optional step-by-step explanations for deeper understanding</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Math Experience?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already discovered the power of AI-assisted mathematics. 
              Start solving complex problems with ease today.
            </p>
            <Button 
              onClick={() => navigate('/calculate')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4 h-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="text-white font-semibold">NeuroMath</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 NeuroMath. Empowering mathematical learning through AI technology.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Created by HaRsH
          </p>
        </div>
      </footer>
    </div>
  );
} 