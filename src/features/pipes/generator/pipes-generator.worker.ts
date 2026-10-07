import { serveGenerator } from '@/features/game-frame/generator/serve-generator'

import { generatePipes } from './pipes-generator'

serveGenerator(generatePipes)
