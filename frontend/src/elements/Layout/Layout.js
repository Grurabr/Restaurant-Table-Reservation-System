import "../../styles/layout.css";
import React from "react";
import { useSelector } from "react-redux";
import { NavBar } from "../NavBar/NavBar";
import { Link } from "react-router-dom";


function Logo({logo}) {
  return (
    <div className="logo cl-1 link-wrapper">
      <img src={logo} alt="Logo" width="60"/>
      <span className='link-text logo-text cl-3 merienda'>Juustokakku</span>
      <Link to="" className='link' />
    </div>
  );
}

function Main({children, isAuth}) {
    return (
        <div className='main'>
            <div className='main-bg-img'></div>
            <div className='main-wrapper cl-2'>
              <div className={"main-content"}>
                {children}
              </div>
            </div>
        </div>
    );
}

const Layout = ({ children }) => {
  const { email } = useSelector((state) => state.user);

  return (
    <>
      <div className="wrapper">
        
        <NavBar />
        <Main isAuth={email}>{children}</Main>
      </div>
    </>
  );
};

export default Layout;
