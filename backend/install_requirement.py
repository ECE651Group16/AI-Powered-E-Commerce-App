import subprocess
import sys


def install_with_pipenv(env):
    command = ["pipenv", "install"]
    if env == "install-dev":
        command.append("--dev")
    subprocess.call(command)


def install_with_pip(env):
    if env == "install-dev":
        subprocess.call(
            ["pipenv", "lock", "--requirements", "--dev"],
            stdout=open("dev-requirements.txt", "w"),
        )
        subprocess.call(["pip", "install", "-r", "dev-requirements.txt"])
    else:
        subprocess.call(
            ["pipenv", "lock", "--requirements"], stdout=open("requirements.txt", "w")
        )
        subprocess.call(["pip", "install", "-r", "requirements.txt"])


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(
            "Usage: python install_requirements.py [pip|pipenv] [install|install-dev]"
        )
        sys.exit(1)

    tool, env = sys.argv[1], sys.argv[2]
    if tool not in ["pip", "pipenv"] or env not in ["install", "install-dev"]:
        print("Invalid command. Use 'pip' or 'pipenv' and 'install' or 'install-dev'.")
        sys.exit(1)

    if tool == "pipenv":
        install_with_pipenv(env)
    elif tool == "pip":
        install_with_pip(env)

# For installing with pipenv (production dependencies): python install_requirements.py pipenv install
# For installing development dependencies with pipenv: python install_requirements.py pipenv install-dev
# For installing with pip (production dependencies): python install_requirements.py pip install
# For installing development dependencies with pip: python install_requirements.py pip install-dev
