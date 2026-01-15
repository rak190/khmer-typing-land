import { Switch, Route } from "wouter";
import { Home } from "@/pages/Home";
import { StageSelect } from "@/pages/StageSelect";
import { Play } from "@/pages/Play";
import { Badges } from "@/pages/Badges";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/world/:id" component={StageSelect} />
      <Route path="/play/:wid/:sid" component={Play} />
      <Route path="/badges" component={Badges} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
