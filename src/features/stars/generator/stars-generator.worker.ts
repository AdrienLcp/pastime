import { serveGenerator } from '@/features/game-frame/generator/serve-generator'

import { generateStars } from './stars-generator'

serveGenerator(generateStars)
