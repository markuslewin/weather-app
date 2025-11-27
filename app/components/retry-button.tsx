import { Icon } from "#app/components/icon";
import { useLocation, useNavigate, useNavigation } from "react-router";

export const RetryButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();

  return (
    <button
      className="[ error__button ] [ mt-300 ]"
      type="button"
      onClick={() => {
        void navigate(location);
      }}
      // Checks for global navigations...
      data-retrying={navigation.state !== "idle"}
    >
      <Icon name="IconRetry" />
      Retry
    </button>
  );
};
