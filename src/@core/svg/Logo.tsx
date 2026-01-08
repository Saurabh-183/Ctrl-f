// import type { ImgHTMLAttributes } from 'react'
//
// type LogoProps = ImgHTMLAttributes<HTMLImageElement>
//
// const Logo = (props: LogoProps) => {
//   return <img src='/CtrlFLogo.png' alt='Company Logo' width={55} height={60} style={{ objectFit: 'contain' }} {...props} />
// }
//
// export default Logo


import type { ImgHTMLAttributes } from "react";

type LogoProps = ImgHTMLAttributes<HTMLImageElement> & {
  collapsed?: boolean;
};

const Logo = ({ collapsed = false, ...props }: LogoProps) => {
  return (
    <img
      src={collapsed ? "/CtrlFLogo-short.png" : "/CtrlFLogo.png"}
      alt="Company Logo"
      width={collapsed ? 60 : 85}
      height={50}
      style={{
        objectFit: "contain",
        transition: "all 0.3s ease",
      }}
      {...props}
    />
  );
};

export default Logo;
