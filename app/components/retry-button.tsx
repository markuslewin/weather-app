import { Icon } from "#app/components/icon";
import { useLocation, useNavigate } from "react-router";

export const RetryButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      className="[ error__button ] [ mt-300 ]"
      type="button"
      onClick={() => {
        void navigate(location);
      }}
    >
      <Icon name="IconRetry" />
      Retry
    </button>
  );
};
