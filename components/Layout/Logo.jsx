import styles from "../../styles/Footer.module.scss";
function Logo() {
  return (
    <div className="flex">
      <img id={styles.logo} src="/favicon.ico" alt="emerald city logo" />
      <span>ReLink Tool</span>
    </div>
  )
}

export default Logo;