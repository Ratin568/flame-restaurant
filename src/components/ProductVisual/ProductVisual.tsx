import VisualAtmosphere from "../VisualAtmosphere/VisualAtmosphere";

import BurgerVisual from "./BurgerVisual/BurgerVisual";
import HeatVisual from "./HeatVisual/HeatVisual";
import MenuVisual from "./MenuVisual/MenuVisual";
import CtaVisual from "./CtaVisual/CtaVisual";

type ProductVisualProps = {
  type:
    | "burger"
    | "heat"
    | "menu"
    | "cta";

  progress?: number;
  velocity?: number;
};

export default function ProductVisual({
  type,
  progress = 0.5,
  velocity = 0,
}: ProductVisualProps) {
  const visual = (() => {
    switch (type) {
      case "burger":
        return (
          <BurgerVisual
            progress={progress}
            velocity={velocity}
          />
        );

      case "heat":
        return (
          <HeatVisual
            progress={progress}
            velocity={velocity}
          />
        );

      case "menu":
        return (
          <MenuVisual
            progress={progress}
            velocity={velocity}
          />
        );

      case "cta":
        return (
          <CtaVisual
            progress={progress}
            velocity={velocity}
          />
        );

      default:
        return null;
    }
  })();

  return (
    <VisualAtmosphere
      type={type}
    >
      {visual}
    </VisualAtmosphere>
  );
}