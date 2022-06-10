import styles from "../../styles/Footer.module.scss";
function Logo() {
  return (
    <div className="flex">
      <img id={styles.logo} src="/favicon.ico" alt="emerald city logo" />
      <span style={{color: "#38e8c6"}}>Link</span>
    </div>
  )
}

export default Logo;