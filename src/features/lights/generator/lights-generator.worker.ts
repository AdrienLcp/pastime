import { serveGenerator } from '@/features/game-frame/generator/serve-generator'

import { generateLights } from './lights-generator'

serveGenerator(generateLights)
