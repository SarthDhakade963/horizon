import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home = () => {

  const loggedIn = {firstName : 'Sarth'};

  return <section className="home">
    <div className="home-content">
      <header className="home-header">
        <HeaderBox 
          type="greeting"
          title="Welcome"
          user={loggedIn?.firstName || 'Guest'} // ? means if the firstName is not provided or not accessed it will not throw error
          subtext="Access and Manage your Account transaction efficiently."
        />

        <TotalBalanceBox 
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={1250.35}
        />
      </header>
    </div>
  </section>;
};

export default Home;
