import { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import Hamburger from 'hamburger-react';
import cx from 'classnames';

import AppMobileMenu from '../AppMobileMenu';
import { setEnableClosedSidebar } from '../../reducers/ThemeOptions';

export default function HeaderLogo() {
  const enableClosedSidebar = useSelector((state) => state.ThemeOptions.enableClosedSidebar);
  const darkMode = useSelector((state) => state.ThemeOptions.darkMode);
  const colorScheme = useSelector((state) => state.ThemeOptions.colorScheme);
  const isDark = darkMode === 'dark' || colorScheme === 'dark';
  const dispatch = useDispatch();

  const toggleEnableClosedSidebar = () => {
    dispatch(setEnableClosedSidebar(!enableClosedSidebar));
  };

  return (
    <Fragment>
      <div className="app-header__logo">
        <Link to="/runs" className="text-decoration-none d-flex align-items-center gap-2">
          <span className="fs-4">⚡</span>
          <span className={cx('fw-bold fs-5 brand-title', { 'text-white': isDark, 'text-dark': !isDark })} style={{ letterSpacing: '-0.3px' }}>
            Genshin<span className="text-primary">DPS</span>
          </span>
        </Link>
        <div className="header__pane ms-auto">
          <div onClick={toggleEnableClosedSidebar}>
            <Hamburger
              toggled={enableClosedSidebar}
              toggle={toggleEnableClosedSidebar}
              size={24}
              color={isDark ? '#cbd5e1' : '#6c757d'}
            />
          </div>
        </div>
      </div>
      <AppMobileMenu />
    </Fragment>
  );
}
