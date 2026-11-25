"use client";

import { BotAvatar } from "bot-avatars";

export type AgentShape = "clover" | "flower" | "star" | "ghost" | "mech" | "square" | "hexagon";

type Props = {
  type: AgentShape;
  size?: number;
  seed?: number;
  className?: string;
  color?: string;
};

const colors: Record<AgentShape, string> = {
  clover: "#72d7ab",
  flower: "#f9a8ce",
  star: "#ffd180",
  ghost: "#b9abf5",
  mech: "#8ec4f9",
  square: "#a9d5ff",
  hexagon: "#c6b6f7",
};

export function AgentAvatar({ type, size = 36, seed = 0.3, className, color }: Props) {
  return (
    <BotAvatar
      type={type}
      size={size}
      face="eyes"
      color={color ?? colors[type]}
      shading="plastic"
      seed={seed}
      theme="light"
      className={className}
      interactive={false}
      turn={0}
      jumpEvery={18}
      jumpHeight={5}
      jumpTime={0.45}
      jumpSpin={0}
      jumpLean={0}
      jumpSquash={0}
      jumpStretch={0}
    />
  );
}
