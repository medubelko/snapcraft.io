import { useState, useEffect } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { Row, Col, Notification, Icon } from "@canonical/react-components";

import ModelNav from "./ModelNav";
import ModelBreadcrumb from "./ModelBreadcrumb";
import Filter from "../../components/Filter";
import PoliciesTable from "./PoliciesTable";
import CreatePolicyForm from "./CreatePolicyForm";
import Navigation from "../../components/Navigation";

import { usePolicies, useSigningKeys } from "../../hooks";
import { ApiError, UsePoliciesResponse } from "../../types/shared";
import {
  policiesListFilterState,
  policiesListState,
} from "../../state/policiesState";
import {
  signingKeysListState,
  newSigningKeyState,
} from "../../state/signingKeysState";
import { brandStoreState } from "../../state/brandStoreState";

import { isClosedPanel, setPageTitle } from "../../utils";

function Policies(): React.JSX.Element {
  const { id, model_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, isError, error, refetch, data }: UsePoliciesResponse =
    usePolicies(id, model_id);
  const signingKeys = useSigningKeys(id);
  const setPoliciesList = useSetAtom(policiesListState);
  const setFilter = useSetAtom(policiesListFilterState);
  const setNewSigningKey = useSetAtom(newSigningKeyState);
  const brandStore = useAtomValue(brandStoreState(id));
  const [searchParams] = useSearchParams();
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [showErrorNotification, setShowErrorNotification] =
    useState<boolean>(false);
  const [showDeletePolicyNotification, setShowDeletePolicyNotification] =
    useState<boolean>(false);
  const [
    showDeletePolicyErrorNotification,
    setShowDeletePolicyErrorNotification,
  ] = useState<boolean>(false);
  const setSigningKeysList = useSetAtom(signingKeysListState);

  useEffect(() => {
    if (!signingKeys.isLoading && !signingKeys.isError) {
      if (signingKeys.data) {
        setSigningKeysList(signingKeys.data);
      } else {
        setSigningKeysList([]);
      }
    }
  }, [signingKeys]);

  useEffect(() => {
    if (!isLoading && !isError) {
      if (data) {
        setPoliciesList(data);
      }
      setFilter(searchParams.get("filter") || "");
    } else {
      setPoliciesList([]);
    }
  }, [isLoading, error, data]);

  brandStore
    ? setPageTitle(`Policies in ${brandStore.name}`)
    : setPageTitle("Policies");

  return (
    <div className="l-application" role="presentation">
      <Navigation sectionName="policies" />
      <main className="l-main">
        <div className="p-panel u-flex-column">
          <div className="p-panel__content u-flex-column u-flex-grow">
            <div className="u-fixed-width">
              <ModelBreadcrumb />
              <h1 className="u-off-screen">{model_id}</h1>
            </div>
            <div className="u-fixed-width">
              <ModelNav sectionName="policies" />
            </div>
            {showNotification && (
              <div className="u-fixed-width">
                <Notification
                  severity="positive"
                  onDismiss={() => {
                    setShowNotification(false);
                  }}
                >
                  New policy created
                </Notification>
              </div>
            )}
            {showDeletePolicyNotification && (
              <div className="u-fixed-width">
                <Notification
                  severity="positive"
                  onDismiss={() => {
                    setShowDeletePolicyNotification(false);
                  }}
                >
                  Policy has been deleted
                </Notification>
              </div>
            )}
            {showErrorNotification && (
              <div className="u-fixed-width">
                <Notification
                  severity="negative"
                  onDismiss={() => {
                    setShowErrorNotification(false);
                  }}
                >
                  Unable to create policy
                </Notification>
              </div>
            )}
            {showDeletePolicyErrorNotification && (
              <div className="u-fixed-width">
                <Notification
                  severity="negative"
                  onDismiss={() => {
                    setShowDeletePolicyErrorNotification(false);
                  }}
                >
                  Unable to delete policy
                </Notification>
              </div>
            )}
            <Row>
              <Col size={6}>
                <Filter
                  state={policiesListFilterState}
                  label="Search policies"
                  placeholder="Search policies"
                />
              </Col>
              <Col size={6} className="u-align--right">
                <Link
                  className="p-button--positive"
                  to={`/admin/${id}/models/${model_id}/policies/create`}
                >
                  Create policy
                </Link>
              </Col>
            </Row>
            <div className="u-fixed-width u-flex-column u-flex-grow">
              <>
                {isError && error && (
                  <Notification severity="negative">
                    Error: {(error as ApiError).message}
                  </Notification>
                )}
                {isLoading ? (
                  <p>
                    <Icon name="spinner" className="u-animation--spin" />
                    &nbsp;Fetching policies...
                  </p>
                ) : (
                  <div className="u-flex-column u-flex-grow">
                    <PoliciesTable
                      setShowDeletePolicyNotification={
                        setShowDeletePolicyNotification
                      }
                      setShowDeletePolicyErrorNotification={
                        setShowDeletePolicyErrorNotification
                      }
                    />
                  </div>
                )}
              </>
            </div>
          </div>
        </div>
      </main>
      <div
        className={`l-aside__overlay ${
          isClosedPanel(location.pathname, "create") ? "u-hide" : ""
        }`}
        onClick={() => {
          navigate(`/admin/${id}/models/${model_id}/policies`);
          setNewSigningKey({ name: "" });
          setShowErrorNotification(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            navigate(`/admin/${id}/models/${model_id}/policies`);
            setNewSigningKey({ name: "" });
            setShowErrorNotification(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Navigate to policies page"
      ></div>
      <aside
        className={`l-aside ${
          isClosedPanel(location.pathname, "create") ? "is-collapsed" : ""
        }`}
      >
        <CreatePolicyForm
          setShowNotification={setShowNotification}
          setShowErrorNotification={setShowErrorNotification}
          refetchPolicies={refetch}
        />
      </aside>
    </div>
  );
}

export default Policies;
