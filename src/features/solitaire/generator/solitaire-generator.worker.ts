import { serveGenerator } from '@/features/game-frame/generator/serve-generator'

import { generateSolitaire } from './solitaire-generator'

serveGenerator(generateSolitaire)
