import type React from 'react'
import { createElement, Fragment, useId } from 'react'

import { hubPathFor } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/link'
import { Main } from '@/presentation/components/main'
import { PageHead } from '@/presentation/components/page-head'
import { DocumentTitle } from '@/presentation/head/document-title'
import { useI18n } from '@/presentation/i18n/i18n-provider'

import { CNIL_COMPLAINT_HREF, HOST, PUBLISHER } from './legal-details'
import { STORED_KEYS } from './stored-keys'

import './legal-page.sass'

/** Spreads what `translate.rich` returned as children, so React asks none of them for a key. */
const RichText: React.FC<{ parts: readonly React.ReactNode[] }> = ({ parts }) =>
  createElement(Fragment, null, ...parts)

type LegalSectionProps = {
  children: React.ReactNode
  heading: string
}

const LegalSection: React.FC<LegalSectionProps> = ({ children, heading }) => {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className='legal-section'>
      <h2 className='section-head' id={headingId}>
        {heading}
      </h2>
      {children}
    </section>
  )
}

/**
 * The French LCEN's legal notice and the privacy policy, on one page every
 * screen's colophon links to.
 */
export const LegalPage: React.FC = () => {
  const { locale, translate } = useI18n()

  const contactLink = (children: string): React.ReactNode => (
    <Link className='legal-link' href={PUBLISHER.contactHrefFor[locale]}>
      {children}
    </Link>
  )

  const cnilLink = (children: string): React.ReactNode => (
    <Link className='legal-link' href={CNIL_COMPLAINT_HREF}>
      {children}
    </Link>
  )

  return (
    <Main className='legal-page'>
      <DocumentTitle>{`${translate('legal.title')} — ${translate('app.name')}`}</DocumentTitle>
      <PageHead
        backHref={hubPathFor(locale)}
        backLabel={translate('common.backToGames')}
        title={translate('legal.title')}
      />
      <p className='legal-intro'>{translate('legal.intro')}</p>

      <LegalSection heading={translate('legal.publisher.heading')}>
        <p>
          <RichText
            parts={translate.rich('legal.publisher.body', {
              contact: contactLink,
              name: PUBLISHER.name
            })}
          />
        </p>
        <p className='legal-aside'>{translate('legal.publisher.address')}</p>
      </LegalSection>

      <LegalSection heading={translate('legal.host.heading')}>
        <p>{translate('legal.host.body')}</p>
        <address className='host-address'>
          {[HOST.name, ...HOST.addressLines].map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
      </LegalSection>

      <LegalSection heading={translate('legal.storage.heading')}>
        <p>{translate('legal.storage.device')}</p>
        <dl className='stored-keys'>
          {STORED_KEYS.map(({ key, purpose }) => (
            <div className='stored-key' key={key}>
              <dt>
                <code>{key}</code>
              </dt>
              <dd>{translate(`legal.storage.keys.${purpose}`)}</dd>
            </div>
          ))}
        </dl>
        <p>{translate('legal.storage.offline')}</p>
        <p>{translate('legal.storage.erase')}</p>
        <p>{translate('legal.storage.server')}</p>
      </LegalSection>

      <LegalSection heading={translate('legal.thirdParties.heading')}>
        <p>{translate('legal.thirdParties.body')}</p>
      </LegalSection>

      <LegalSection heading={translate('legal.measurement.heading')}>
        <p>{translate('legal.measurement.body')}</p>
      </LegalSection>

      <LegalSection heading={translate('legal.rights.heading')}>
        <p>
          <RichText
            parts={translate.rich('legal.rights.body', {
              contact: contactLink
            })}
          />
        </p>
        <p>
          <RichText
            parts={translate.rich('legal.rights.complaint', {
              authority: cnilLink
            })}
          />
        </p>
      </LegalSection>
    </Main>
  )
}
