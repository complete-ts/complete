import Heading from "@theme/Heading";
import styles from "./styles.module.css";

interface FeatureItem {
  num: number;
  title: string;
  iconName: string;
  description: React.JSX.Element;
}

// eslint-disable-next-line complete/require-capital-const-assertions, complete/require-capital-read-only
const FeatureList: FeatureItem[] = [
  {
    num: 1,
    title: "Maximum Safe TypeScript",
    iconName: "helmet-safety",
    description: (
      <>Complete is a set of packages to make working with TypeScript safer.</>
    ),
  },
  {
    num: 2,
    title: "Clean Configs",
    iconName: "bath",
    description: (
      <>
        TypeScript tooling can be complex. Keep your project clean by
        abstracting away as much of the tooling complexity as possible.
      </>
    ),
  },
  {
    num: 3,
    title: "Free & Open Source",
    iconName: "id-card",
    description: <>Complete is MIT licensed and supported by the community.</>,
  },
];

function Feature({ num, title, iconName, description }: FeatureItem) {
  return (
    <div className={`col col--4 ${styles["feature"]}`}>
      <div className="text--center">
        <br />
        <span className="fa-stack fa-3x">
          <div
            className={`fa fa-circle fa-stack-2x ${styles[`circle-accent${num}`]}`}
          ></div>
          <div
            className={`fa fa-solid fa-${iconName} fa-stack-1x fa-inverse`}
          ></div>
        </span>
        <br />
        <br />
      </div>

      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.JSX.Element {
  return (
    <section className={styles["features"]}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
