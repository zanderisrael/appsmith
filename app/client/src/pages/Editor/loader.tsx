import React, { lazy, Suspense } from "react";
import PageLoadingBar from "pages/common/PageLoadingBar";
import { retryPromise } from "utils/AppsmithUtils";

const Editor = lazy(() =>
  retryPromise(() => import(/* webpackChunkName: "editor" */ "./index")),
);

function EditorLoader(props: any) {
  return (
    <Suspense fallback={<PageLoadingBar />}>
      <Editor {...props} />
    </Suspense>
  );
}

export default EditorLoader;
