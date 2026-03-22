import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ff7a00] shadow-[0_0_20px_rgba(255,161,22,0.3)]"></div>
            <span className="font-outfit text-xl font-bold tracking-tight">LeetCollab</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
            <a href="#features" className="hover:text-[#ffa116] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#ffa116] transition-colors">How it Works</a>
            <a href="#" className="hover:text-[#ffa116] transition-colors">Extension</a>
          </div>
          <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-[#ffa116] transition-all hover:scale-105">
            Download Extension
          </button>
        </div>
      </nav>

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6 lg:py-32">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-[#ffa116]/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500/10 blur-[100px] rounded-full"></div>

          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div className="inline-flex self-center lg:self-start items-center gap-2 rounded-full border border-[#ffa116]/30 bg-[#ffa116]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#ffa116]">
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#ffa116]"></span>
                  Live Collaboration for LeetCode
                </div>
                <h1 className="font-outfit text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl">
                  Don't Solve <br />
                  <span className="bg-gradient-to-r from-[#ffa116] to-[#ff7a00] bg-clip-text text-transparent">Alone Anymore</span>
                </h1>
                <p className="mx-auto max-w-xl text-lg leading-relaxed text-white/60 lg:mx-0">
                  Connect with live developers currently tackling the same problem. 
                  Start a video call, share insights, and master DSA together.
                </p>
                <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <button className="h-14 rounded-2xl bg-[#ffa116] px-8 text-lg font-bold text-black shadow-[0_4px_20px_rgba(255,161,22,0.4)] transition-all hover:scale-105 active:scale-95">
                    Install Extension — It's Free
                  </button>
                  <button className="h-14 rounded-2xl border border-white/10 bg-white/5 px-8 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/10">
                    Watch Demo
                  </button>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-[#ffa116] to-blue-500 opacity-20 blur-xl transition-all group-hover:opacity-40"></div>
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-2xl">
                  <Image
                    src="/hero.png"
                    alt="LeetCollab Platform Hero"
                    width={1200}
                    height={800}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 text-center">
              <h2 className="font-outfit text-4xl font-bold tracking-tight sm:text-5xl">Engineered for Better Learning</h2>
              <p className="mt-4 text-white/50">Everything you need to level up your interview preparation.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Live Presence",
                  desc: "Instantly see how many other users are solving the same problem as you in real-time.",
                  icon: "👥",
                  color: "bg-blue-500"
                },
                {
                  title: "Instant Invites",
                  desc: "Send a request to any active user with one click. No coordination needed.",
                  icon: "⚡",
                  color: "bg-[#ffa116]"
                },
                {
                  title: "Video Collaboration",
                  desc: "Switch to a video call effortlessly to discuss approaches and debug together.",
                  icon: "📽️",
                  color: "bg-purple-500"
                }
              ].map((feature, i) => (
                <div key={i} className="group relative rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.05]">
                  <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color} text-2xl shadow-lg shadow-black/20`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-4 text-xl font-bold">{feature.title}</h3>
                  <p className="leading-relaxed text-white/50">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6 font-outfit">
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#ffa116] to-[#ff7a00] p-12 text-center md:p-20">
              <div className="absolute top-0 left-0 h-full w-full opacity-10 grayscale invert bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <h2 className="relative text-4xl font-black text-black sm:text-6xl">Ready to solve <br/>faster?</h2>
              <p className="relative mt-6 text-xl font-medium text-black/80">Join thousands of developers leveling up together.</p>
              <button className="relative mt-10 h-16 rounded-2xl bg-black px-12 text-xl font-bold text-white transition-all hover:scale-105 active:scale-95">
                Get LeetCollab Extension
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[#ffa116]"></div>
            <span className="font-outfit text-lg font-bold tracking-tight">LeetCollab</span>
          </div>
          <p className="text-sm text-white/30">© 2026 LeetCollab Platform. Built for the coding community.</p>
          <div className="flex gap-6 text-sm text-white/50 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
