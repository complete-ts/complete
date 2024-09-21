import {
  BookOpenIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "@heroicons/react/24/solid";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

interface FeatureItem {
  title: string;
  icon: React.JSX.Element;
  description: React.JSX.Element;
}

const ICON_SIZE = "8em";

// eslint-disable-next-line complete/require-capital-const-assertions, complete/require-capital-read-only
const FeatureList: FeatureItem[] = [
  {
    title: "Maximum Safe TypeScript",
    icon: <ShieldCheckIcon style={{ width: ICON_SIZE, height: ICON_SIZE }} />,
    description: (
      <>
        Writing safe TypeScript is non-trivial. Complete makes it as easy and
        safe as possible.
      </>
    ),
  },
  {
    title: "Clean Configs",
    icon: <WrenchIcon style={{ width: ICON_SIZE, height: ICON_SIZE }} />,
    description: (
      <>
        TypeScript tooling can be complex. Keep your project clean by
        abstracting away as much of the tooling complexity as possible.
      </>
    ),
  },
  {
    title: "Free & Open Source",
    icon: <BookOpenIcon style={{ width: ICON_SIZE, height: ICON_SIZE }} />,
    description: <>Complete is MIT licensed and supported by the community.</>,
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={`col col--4 ${styles["feature"]}`}>
      <div className="text--center padding-horiz--md">
        {icon}
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
