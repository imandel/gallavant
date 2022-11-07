# Gallavant

<!-- [![Build Status](https://travis-ci.org//gallavant.svg?branch=master)](https://travis-ci.org//gallavant)
[![codecov](https://codecov.io/gh//gallavant/branch/master/graph/badge.svg)](https://codecov.io/gh//gallavant) -->

A jupyter widget for analysis of geospatial video data


## Installation

You can install using `pip`:

```bash
pip install gallavant
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:

```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] gallavant
```

## Usage

### Initialization
![init](./assets/init.gif)

The first load may be a bit slow but will create a `.peaks.json` file in the same directory as your source video. Subsequent loads will be significantly faster. 
#### Optional:
for more screen real estate run
```python
from IPython.core.display import display, HTML
display(HTML("<style>.container { width:100% !important; }</style>"))
```

### Navigation
Navigate a video by clicking the timeline, a transcript line, or a point on the map.
![navigation](assets/navigation.gif)

### Tag Selection 



## Data Formats and Structure



## Development Installation

Create a dev environment:

```bash
conda create -n gallavant-dev -c conda-forge nodejs yarn python jupyterlab
conda activate gallavant-dev
```

Install the python. This will also build the TS package.

```bash
pip install -e .
```

When developing your extensions, you need to manually enable your extensions with the
notebook frontend. 
<!-- For lab, this is done by the command: -->
<!-- 
```
jupyter labextension develop --overwrite .
yarn run build
``` -->

You need to run:

```
jupyter nbextension install --sys-prefix --symlink --overwrite --py gallavant
jupyter nbextension enable --sys-prefix --py gallavant
```

Note that the `--symlink` flag doesn't work on Windows, so you will here have to run
the `install` command every time that you rebuild your extension. For certain installations
you might also need another flag instead of `--sys-prefix`, but we won't cover the meaning
of those flags here.

### How to see your changes
### Jupyter Notebook:
For Jupyter Notebook you can just watch for JS changes:

```bash
yarn watch
```

<!-- #### Jupyter Lab:
If you use JupyterLab to develop then you can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the widget.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
yarn watch
# Watch to rebuild JupyterLab
jupyter labextension watch
# Run JupyterLab in another terminal
jupyter lab
```

After a change wait for the build to finish and then refresh your browser and the changes should take effect. -->

#### Python:
If you make a change to the python code then you will need to restart the notebook kernel to have it take effect.
