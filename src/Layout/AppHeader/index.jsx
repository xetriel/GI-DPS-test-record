import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import cx from 'classnames';

import { CSSTransition, TransitionGroup } from '../../utils/TransitionWrapper';
import HeaderLogo from '../AppLogo';
import SearchBox from './Components/SearchBox';

export default function Header() {
  const headerBackgroundColor = useSelector((s) => s.ThemeOptions.headerBackgroundColor);
  const enableMobileMenuSmall = useSelector((s) => s.ThemeOptions.enableMobileMenuSmall);
  const enableHeaderShadow = useSelector((s) => s.ThemeOptions.enableHeaderShadow);

  return (
    <Fragment>
      <TransitionGroup>
        <CSSTransition
          component="header"
          className={cx('app-header', headerBackgroundColor, {
            'header-shadow': enableHeaderShadow,
          })}
          role="banner"
          appear={true}
          timeout={1500}
          enter={false}
          exit={false}
        >
          <HeaderLogo />
          <div
            className={cx('app-header__content', {
              'header-mobile-open': enableMobileMenuSmall,
            })}
          >
            <div className="app-header-left d-flex align-items-center gap-2">
              <SearchBox />
              <span className="badge bg-warning text-dark fw-bold px-2 py-1 ms-2 d-none d-md-inline-block">
                v7.0 Active
              </span>
            </div>
            <div className="app-header-right d-flex align-items-center gap-2">
              <Link
                to="/upload"
                className="btn btn-sm btn-primary fw-bold shadow-sm d-flex align-items-center gap-1 px-3 py-1"
              >
                <span>📤</span>
                <span className="d-none d-sm-inline">Quick Upload</span>
              </Link>
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </Fragment>
  );
}
