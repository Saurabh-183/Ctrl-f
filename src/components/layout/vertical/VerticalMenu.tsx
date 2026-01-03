'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
// import { useSettings } from '@core/hooks/useSettings'

import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  const { transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // @ts-ignore
  // @ts-ignore
  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={{
          button: {
            backgroundColor: '#000000',
            color: '#FFF',

            '&:hover': {
              color: '#262262'
            },

            '&.active, &[data-active="true"]': {
              backgroundColor: '#1171B2',
              color: '#262262',

              '& .menu-item-label': {
                color: '#262262'
              },

              '& i': {
                color: '#262262'
              }
            }
          },

          label: { color: '#F2F4F6' },
          icon: { color: '#FFF' }
        }}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='tabler-dashboard' />}>
          Dashboard
        </MenuItem>

        <SubMenu label='Master' icon={<i className='tabler-crown' />}>
          <MenuItem href='/users'>Users</MenuItem>
          <MenuItem href='/brand/list-brand'>Brand</MenuItem>
          <MenuItem href='/supplier/list-supplier'>Supplier</MenuItem>
          <MenuItem href='/customer/list-customer'>Customer</MenuItem>

          <MenuItem href='/product/list-product'>Product</MenuItem>
          <MenuItem href='/attributes'>Attributes</MenuItem>
          <MenuItem href='/listcategory'>Category</MenuItem>
          <MenuItem href='/list-sub-category'>Sub-Category</MenuItem>
        </SubMenu>
        <MenuItem href='/approvalmatrix' icon={<i className='tabler-brand-matrix' />}>
          Approval Matrix
        </MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
