from config.settings import db_env


def test_db_env_prefers_postgres_variable(monkeypatch):
    monkeypatch.setenv("POSTGRES_DB", "local_db")
    monkeypatch.setenv("PGDATABASE", "managed_db")

    assert db_env("POSTGRES_DB", "PGDATABASE", "fallback") == "local_db"


def test_db_env_falls_back_to_standard_pg_variable(monkeypatch):
    monkeypatch.delenv("POSTGRES_DB", raising=False)
    monkeypatch.setenv("PGDATABASE", "managed_db")

    assert db_env("POSTGRES_DB", "PGDATABASE", "fallback") == "managed_db"


def test_db_env_uses_default_when_both_are_missing(monkeypatch):
    monkeypatch.delenv("POSTGRES_DB", raising=False)
    monkeypatch.delenv("PGDATABASE", raising=False)

    assert db_env("POSTGRES_DB", "PGDATABASE", "fallback") == "fallback"
