import { MoonIconOutline, SunIconOutline, QuestionMarkCircleIconOutline } from '@neo4j-ndl/react/icons';
import { Typography, IconButton, Tabs, Switch, Logo, Dialog } from '@neo4j-ndl/react';
import React, { useState } from 'react';
import { ThemeWrapperContext } from '../context/ThemeWrapper';
import User from './User';
import imgHelp from '../assets/img/graph-game-help.gif';

export default function Header({
  title,
  navItems = [],
  activeNavItem = navItems[0],
  setActiveNavItem = () => { },
  useNeo4jConnect = false,
  connectNeo4j = false,
  setConnectNeo4j = () => { },
  openConnectionModal = () => { },
  userHeader = true,
}: {
  title: string;
  navItems?: string[];
  activeNavItem?: string;
  setActiveNavItem?: (activeNavItem: string) => void;
  useNeo4jConnect?: boolean;
  connectNeo4j?: boolean;
  setConnectNeo4j?: (connectNeo4j: boolean) => void;
  openConnectionModal?: () => void;
  userHeader?: boolean;
}) {
  const themeUtils = React.useContext(ThemeWrapperContext);
  const [themeMode, setThemeMode] = useState<string>(themeUtils.colorMode);
  const [openHelp, setOpenHelp] = useState<boolean>(false);

  const toggleColorMode = () => {
    setThemeMode((prevThemeMode) => {
      return prevThemeMode === 'light' ? 'dark' : 'light';
    });
    themeUtils.toggleColorMode();
  };

  const toogleOpenHelp = () => {
    setOpenHelp(!openHelp);
  }

  return (
    <div className='n-bg-palette-neutral-bg-weak p-1 border-b-2 border-[rgb(var(--theme-palette-neutral-border-weak))] h-16'>
      <nav
        className='flex items-center justify-between'
        role='navigation'
        data-testid='navigation'
        id='navigation'
        aria-label='main navigation'
      >
        <section className='flex md:flex-row flex-col items-center w-1/6 shrink-0 grow-0'>
          <div className='md:inline-block'>
            <Logo className='h-6 min-h-6 min-w-12 md:h-8 md:min-h-12 md:min-w-24 md:mr-2' type='full' />
          </div>
          <div className='flex justify-center md:ml-0 pl-0'>
            <Typography className='md:inline-block hidden' variant='h6'>
              {title}
            </Typography>
            <Typography className='md:hidden inline-block' variant='subheading-small'>
              {title}
            </Typography>
          </div>
        </section>

        <section className='flex w-1/3 shrink-0 grow-0 justify-center items-center mb-[-26px]'>
          <Tabs size='large' fill='underline' onChange={(e) => setActiveNavItem(e)} value={activeNavItem}>
            {navItems.map((item) => (
              <Tabs.Tab tabId={item} key={item}>
                {item}
              </Tabs.Tab>
            ))}
          </Tabs>
        </section>
        <section className='flex items-center justify-end w-1/6 grow-0'>
          <div>
            <div className='flex grow-0 gap-x-1 w-max items-center pr-3'>
              {useNeo4jConnect ? (
                <Switch
                  checked={connectNeo4j}
                  onChange={(e) => {
                    if (e.target.checked) {
                      openConnectionModal();
                    } else {
                      setConnectNeo4j(false);
                    }
                  }}
                  disabled={false}
                  fluid={true}
                  label={`Connect${connectNeo4j ? 'ed' : ''} to Neo4j`}
                  labelBefore={true}
                />
              ) : null}
              <IconButton aria-label='Toggle Dark mode' clean size='large' onClick={toggleColorMode}>
                {themeMode === 'dark' ? (
                  <span role='img' aria-label='sun'>
                    <SunIconOutline />
                  </span>
                ) : (
                  <span role='img' aria-label='moon'>
                    <MoonIconOutline />
                  </span>
                )}
              </IconButton>
              <IconButton className='hidden md:inline-flex' aria-label='Help' clean size='large' onClick={toogleOpenHelp}>
                <QuestionMarkCircleIconOutline />
              </IconButton>

              {userHeader ? (
                <div className='hidden md:inline-block'>
                  <User />
                </div>
              ) : null}
              <Dialog size='small' open={openHelp} aria-labelledby='form-dialog-title' onClose={toogleOpenHelp}>
                <Dialog.Header id='form-dialog-title'>GraphGame - Help</Dialog.Header>
                <Dialog.Content className='n-flex n-flex-col n-gap-token-4'>
                  <div>Welcome to the Graph Game, developed by Neo4j community!</div>

                  <div>The objective of the game is to complete as many levels as possible in 2 minutes. </div>

                  <div>Arrange the graph so that its relationships do not intersect, following the example below:</div>
                  <div>
                    <img src={imgHelp} alt="Help" />
                  </div>
                  <Typography variant='body-small' className='ml-2.5'>Based on https://treksit.com (R.I.P.) </Typography>
                </Dialog.Content>
              </Dialog>
            </div>
          </div>
        </section>
      </nav>
    </div>
  );
}