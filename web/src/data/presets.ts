import {
  Bomb,
  Brain,
  Cpu,
  Pen,
  PhoneOutgoing,
  Scale,
  Timer,
  Zap
} from "lucide-react";
import { SessionConfig, defaultSessionConfig } from "./playground-state";
import { alexaThompson, alexaThompsonHard, emilyRodriguez, jordanaBaker, sophiaNguyen, christineContract, belindaTheBestRecruiter, emmaTemp } from "./prompts";
import { VoiceId } from "./voices";

export interface Preset {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  sessionConfig: SessionConfig;
  defaultGroup?: PresetGroup;
  icon?: React.ElementType;
}

export enum PresetGroup {
  FUNCTIONALITY = "Use-Case Demos",
  PERSONALITY = "Fun Style & Personality Demos",
}

export const defaultPresets: Preset[] = [
  // Functionality Group
  {
    id: "alexa-saas-hiring-manager",
    name: "SaaS Hiring Manager",
    description:
      "A busy and rude SAAS hiring manager that needs your hiring services but doesn't want to pay for them.",
    instructions: alexaThompson
,
    sessionConfig: { ...defaultSessionConfig },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Cpu,
  },
    // Functionality Group
  {
    id: "hard-alex-hiring manager",
    name: "HARD SaaS Hiring Manager",
    description:
      "A Very Hard call with the SAAS hiring manager that needs your hiring services!",
    instructions: alexaThompsonHard
,
    sessionConfig: { ...defaultSessionConfig },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Bomb,
  },
  {
    id: "chris-contract",
    name: "Christine Contract Negotiation",
    description:
      "You are negotiating a contract with Christine, a potential client.",
    instructions: christineContract,
    sessionConfig: { ...defaultSessionConfig },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Pen,
  },
  {
    id: "belinda-recruiter",
    name: "Belinda The Best Rececruiter",
    description:
      "You are a fantastic recruiter with a great track record",
    instructions: belindaTheBestRecruiter,
    sessionConfig: { ...defaultSessionConfig },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Brain,
  },
  {
    id: "emma-temp",
    name: "Emma Temporary Workers",
    description:
      "Emma is head of talent aquisitions and staff temp workers",
    instructions: emmaTemp,
    sessionConfig: { ...defaultSessionConfig },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Timer,
  },

  {
    id: "emily-renewable-energy",
    name: "Emily, Renewable Energy Company",
    description: "A representative from a renewable energy company.",
    instructions: emilyRodriguez,
    sessionConfig: {
      ...defaultSessionConfig,
      voice: VoiceId.echo,
    },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Zap,
  },
  {
    id: "sophia-law-firm",
    name: "Sophia, Law Firm",
    description:
      "A busy hiring manager at a law firm that needs your hiring services.",
    instructions: sophiaNguyen,
    sessionConfig: {
      ...defaultSessionConfig,
      voice: VoiceId.shimmer,
    },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: Scale,
  },
  {
    id: "jordan-cold-calling",
    name: "Jordan, Cold Calling",
    description:
      "You are a cold calling recruiter trying to call Alex Thompson. ",
    instructions: jordanaBaker,
    sessionConfig: {
      ...defaultSessionConfig,
      voice: VoiceId.alloy,
    },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    icon: PhoneOutgoing,
  },
];
