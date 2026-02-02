import { Switch, Route } from "wouter";
import { Landing } from "@/pages/Landing";
import { Home } from "@/pages/Home";
import { StageSelect } from "@/pages/StageSelect";
import { Play } from "@/pages/Play";
import { Badges } from "@/pages/Badges";
import { Library } from "@/pages/Library";
import { Stats } from "@/pages/Stats";
import { Challenges } from "@/pages/Challenges";
import { TimedTest } from "@/pages/TimedTest";
import { FreeTyping } from "@/pages/FreeTyping";
import { AccuracyMode } from "@/pages/AccuracyMode";
import { Multiplayer } from "@/pages/Multiplayer";
import { ThemeSelector } from "@/pages/ThemeSelector";
import { CulturalChallenges } from "@/pages/CulturalChallenges";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/world/:id" component={StageSelect} />
      <Route path="/play/:wid/:sid" component={Play} />
      <Route path="/badges" component={Badges} />
      <Route path="/library" component={Library} />
      <Route path="/stats" component={Stats} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/timed" component={TimedTest} />
      <Route path="/accuracy" component={AccuracyMode} />
      <Route path="/free" component={FreeTyping} />
      <Route path="/multiplayer" component={Multiplayer} />
      <Route path="/themes" component={ThemeSelector} />
      <Route path="/cultural" component={CulturalChallenges} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="khmer-pattern-overlay" />
      
      {/* Subtle Floating Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
        <div className="absolute top-[10%] left-[5%] text-6xl animate-float" style={{ animationDelay: '0s' }}>🇰🇭</div>
        <div className="absolute top-[60%] left-[85%] text-4xl animate-float" style={{ animationDelay: '2s' }}>🏺</div>
        <div className="absolute top-[20%] left-[80%] text-5xl animate-float" style={{ animationDelay: '4s' }}>🌸</div>
        <div className="absolute top-[80%] left-[15%] text-4xl animate-float" style={{ animationDelay: '6s' }}>🐘</div>
      </div>

      <Router />
    </div>
  );
}

export default App;
