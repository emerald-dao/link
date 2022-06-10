import CitySvg from "./CitySvg";
import Logo from "./Logo";
import styles from "../../styles/Footer.module.scss";
import Link from "next/link";

function Footer() {
  return (
    <footer className={styles.footer}>
      <CitySvg />
      <div>
        <div className={`${styles.container} ${styles.gutterY} medium column`}>
          <div className={`${styles.flexContainer}`}>
            <p>2022. All rights reserved.</p>
            <Link href="/">
              <a><Logo /></a>
            </Link>
            <p>
              Created by <a href="https://discord.gg/emeraldcity" target="_blank" rel="noreferrer" style={{color: "#38e8c6"}}>Emerald City DAO</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;