package com.spreaddit;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.rnfs.RNFSPackage;
import android.os.Bundle;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.common.LifecycleState;
public class MainActivity extends ReactActivity{

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Spreaddit";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the rendered you wish to use (Fabric or the older renderer).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }
  }

  // @Override
  // protected void onCreate(Bundle savedInstanceState) {
  //   super.onCreate(savedInstanceState);
  //   ReactRootView reactRootView = new ReactRootView(this);

  //   ReactInstanceManager reactInstanceManager = ReactInstanceManager.builder()
  //     .setApplication(getApplication())
  //     .setBundleAssetName("index.android.bundle")
  //     .setJSMainModulePath("index.android")
  //     .addPackage(new MainReactPackage())
  //     .addPackage(new RNFSPackage())      // <------- add package
  //     .setUseDeveloperSupport(BuildConfig.DEBUG)
  //     .setInitialLifecycleState(LifecycleState.RESUMED)
  //     .build();

  //   reactRootView.startReactApplication(reactInstanceManager, "ExampleRN", null);

  //   setContentView(reactRootView);
  // }
}
