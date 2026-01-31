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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
