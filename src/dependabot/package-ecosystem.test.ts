import { getPackageEcosystem } from "./package-ecosystem";
import each from 'jest-each';

each([
    [ '' ],
    [ 'a/b/c/' ],
    [ 'C:/project/' ]
]).it('path with or without prefix gives correct ecosystem', (prefix) => {
    expect(getPackageEcosystem(`${prefix}pom.xml`)).toBe('maven')
    expect(getPackageEcosystem(`${prefix}package.json`)).toBe('npm')
    expect(getPackageEcosystem(`${prefix}requirements.txt`)).toBe('pip')
    expect(getPackageEcosystem(`${prefix}something.else`)).toBe(undefined)
})