import React from "react";
import { Route, Switch } from "wouter";
import { AppShell } from "./components/layout/AppShell";
import { Home } from "./routes/Home";
import { ZoneSection } from "./routes/ZoneSection";
import { Settings } from "./routes/Settings";
import { Profile } from "./routes/Profile";
import { World } from "./routes/World";
import {
  YouChannel,
  YouCreator,
  YouUpload,
  YouWatch
} from "./routes/YouZoneExtras";

const zoneList = [
  "x",
  "you",
  "shorts",
  "live",
  "threads",
  "pins",
  "watch",
  "stream",
  "sell",
  "shop",
  "ai",
  "mind",
  "weather",
  "tools",
  "chat",
  "dialer",
  "coins",
  "velox",
  "nexus",
  "world"
];

const zoneSectionRoute = (zoneKey: string) => (
  <>
    <Route
      path={`/${zoneKey}`}
      component={() => <ZoneSection zoneKey={zoneKey} section="feed" />}
    />
    <Route
      path={`/${zoneKey}/:section`}
      component={({ section }) => (
        <ZoneSection zoneKey={zoneKey} section={section} />
      )}
    />
  </>
);

const App = () => (
  <AppShell>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/u/:username" component={({ username }) => <Profile username={username} />} />
      <Route path="/world" component={World} />
      <Route path="/you/watch/:id" component={({ id }) => <YouWatch id={id} />} />
      <Route
        path="/you/channel/:handle"
        component={({ handle }) => <YouChannel handle={handle} />}
      />
      <Route path="/you/upload" component={YouUpload} />
      <Route path="/you/creator" component={YouCreator} />
      {zoneList.map((zoneKey) => (
        <React.Fragment key={zoneKey}>{zoneSectionRoute(zoneKey)}</React.Fragment>
      ))}
      <Route>
        <ZoneSection zoneKey="x" section="feed" />
      </Route>
    </Switch>
  </AppShell>
);

export default App;
