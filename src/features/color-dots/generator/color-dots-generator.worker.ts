import { serveGenerator } from '@/features/game-frame/generator/serve-generator'

import { generateColorDots } from './color-dots-generator'

serveGenerator(generateColorDots)
