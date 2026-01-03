import type { ImgHTMLAttributes } from 'react'

type LogoProps = ImgHTMLAttributes<HTMLImageElement>

const Logo = (props: LogoProps) => {
  return <img src='/logo.svg' alt='Company Logo' width={140} height={75} style={{ objectFit: 'contain' }} {...props} />
}

export default Logo
