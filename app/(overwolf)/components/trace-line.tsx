import { useMap } from "@/app/components/(map)/map";
import { useGameInfoStore, useSettingsStore } from "@/app/lib/storage";
import leaflet from "leaflet";
import { useEffect, useRef, useState } from "react";
import {
  GameSession,
  addTraceLineItem,
  getLatestGameSession,
} from "../lib/game-sessions";

function createCircle(position: { x: number; y: number; z: number }) {
  return leaflet.circle([position.y, position.x] as [number, number], {
    radius: 0,
    interactive: false,
    color: "#8a8374",
  });
}

export default function TraceLine() {
  const map = useMap();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const player = useGameInfoStore((state) => state.player);
  const lastPosition = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });
  const layerGroup = useRef<leaflet.LayerGroup | null>(null);
  const settingsStore = useSettingsStore();

  useEffect(() => {
    layerGroup.current = new leaflet.LayerGroup();

    getLatestGameSession().then(setGameSession);
  }, []);

  useEffect(() => {
    if (!gameSession || !layerGroup.current || !settingsStore.showTraceLine) {
      return;
    }

    layerGroup.current.addTo(map);
    gameSession.traceLine.forEach((position) => {
      const circle = createCircle(position);
      circle.addTo(layerGroup.current!);
    });

    return () => {
      layerGroup.current!.removeFrom(map);
    };
  }, [gameSession, settingsStore.showTraceLine]);

  useEffect(() => {
    if (!player?.position) {
      return;
    }

    if (
      Math.abs(player.position.x - lastPosition.current.x) > 0.05 ||
      Math.abs(player.position.y - lastPosition.current.y) > 0.05
    ) {
      const circle = createCircle(player.position);
      circle.addTo(layerGroup.current!);
      lastPosition.current = player.position;
      addTraceLineItem(player.position);
    }
  }, [player?.position]);

  return <></>;
}
